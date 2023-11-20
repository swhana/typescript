enum TagType {
  Paragraph, //문단
  Header1,
  Header2,
  Header3,
  Header4,
  Header5,
  Header6,
  Underscore, //밑줄
  Emphasize, //이탤릭체
  Strong, //두껍게
  Link, //링크
  HorizontalRule, //수평선
}

interface IMarkdownDocument {
  Add(...content: string[]): void;
  Get(): string;
}

//방문자 인터페이스
interface IVisitor {
  Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void;
}

//방문 가능한 객체 인터페이스
interface IVisitable {
  Accept(
    visitor: IVisitor,
    token: ParseElement,
    markdownDocument: IMarkdownDocument
  ): void;
}

abstract class VisitorBase implements IVisitor {
  constructor(
    private readonly tagType: TagType,
    private readonly TagTypeToHtml: TagTypeToHtml
  ) {}
  Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void {
    markdownDocument.Add(
      this.TagTypeToHtml.OpeningTag(this.tagType),
      token.CurrentLine,
      this.TagTypeToHtml.ClosingTag(this.tagType)
    );
  }
}

abstract class Handler<T> {
  protected next: Handler<T> | null = null;
  public SetNext(next: Handler<T>): void {
    this.next = next;
  }
  public HandleRequest(request: T): void {
    if (!this.CanHandle(request)) {
      if (this.next !== null) {
        this.next.HandleRequest(request); //다음 클래스로 요청 처리 넘기기
      }
      return;
    }
  }
  protected abstract CanHandle(request: T): boolean;
}

class LineParser {
  public Parse(value: string, tag: string): [boolean, string] {
    let output: [boolean, string] = [false, ""];
    output[1] = value;
    if (value === "") {
      return output;
    }
    let split = value.startsWith(`${tag}`);
    if (split) {
      output[0] = true;
      output[1] = value.substring(tag.length);
    }
    return output;
  }
}

class ParseChainHandler extends Handler<ParseElement> {
  private readonly visitable: IVisitable = new Visitable();
  protected CanHandle(request: ParseElement): boolean {
    let split = new LineParser().Parse(request.CurrentLine, this.tagType);
    if (split[0]) {
      request.CurrentLine = split[1];
      this.visitable.Accept(this.visitor, request, this.document);
    }
    return split[0];
  }

  constructor(
    private readonly document: IMarkdownDocument,
    private readonly tagType: string,
    private readonly visitor: IVisitor
  ) {
    super();
  }
}

class ParagraphHandler extends Handler<ParseElement> {
  private readonly visitable: IVisitable = new Visitable();
  private readonly visitor: IVisitor = new ParagraphVisitor();
  protected CanHandle(request: ParseElement): boolean {
    this.visitable.Accept(this.visitor, request, this.document);
    return true;
  }

  constructor(private readonly document: IMarkdownDocument) {
    super();
  }
}

//핸들러 구현체
class Header1ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "# ", new Header1Visitor());
  }
}

class Header2ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "## ", new Header2Visitor());
  }
}

class Header3ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "### ", new Header3Visitor());
  }
}

class Header4ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "#### ", new Header4Visitor());
  }
}

class Header5ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "##### ", new Header5Visitor());
  }
}

class Header6ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "###### ", new Header6Visitor());
  }
}

class HorizontalRuleHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "---", new HorizontalRuleVisitor());
  }
}

class EmphasizeHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "* ", new EmphasizeVisitor());
  }
}

class StrongHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "** ", new StrongVisitor());
  }
}

class LinkHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "! ", new LinkVisitor());
  }
}

class UnderscoreHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "~~ ", new UnderscoreVisitor());
  }
}

//방문자 패턴과 연결 책임 권한 패턴 연결하는 클래스
class ChainOfResponsibilityFactory {
  Build(document: IMarkdownDocument): ParseChainHandler {
    let header1: Header1ChainHandler = new Header1ChainHandler(document);
    let header2: Header2ChainHandler = new Header2ChainHandler(document);
    let header3: Header3ChainHandler = new Header3ChainHandler(document);
    let header4: Header4ChainHandler = new Header4ChainHandler(document);
    let header5: Header5ChainHandler = new Header5ChainHandler(document);
    let header6: Header6ChainHandler = new Header6ChainHandler(document);
    let horizontalRule: HorizontalRuleHandler = new HorizontalRuleHandler(
      document
    );
    let paragraph: ParagraphHandler = new ParagraphHandler(document);
    let emphasize: EmphasizeHandler = new EmphasizeHandler(document);
    let strong: StrongHandler = new StrongHandler(document);
    let link: LinkHandler = new LinkHandler(document);
    let underscore: UnderscoreHandler = new UnderscoreHandler(document);

    header1.SetNext(header2);
    header2.SetNext(header3);
    header3.SetNext(header4);
    header4.SetNext(header5);
    header5.SetNext(header6);
    header6.SetNext(horizontalRule);
    horizontalRule.SetNext(emphasize);
    emphasize.SetNext(strong);
    strong.SetNext(link);
    link.SetNext(underscore);
    underscore.SetNext(paragraph);

    return header1;
  }
}

class Visitable implements IVisitable {
  Accept(
    visitor: IVisitor,
    token: ParseElement,
    markdownDocument: IMarkdownDocument
  ): void {
    visitor.Visit(token, markdownDocument);
  }
}

//content 업데이트만을 수행하는 클래스(단일 책임 원칙)
class MarkdownDocument implements IMarkdownDocument {
  private content: string = "";
  Add(...content: string[]): void {
    content.forEach((element) => {
      this.content += element;
    });
  }
  Get(): string {
    return this.content;
  }
}

//현재 파싱 처리 중인 줄을 표시하는 클래스
class ParseElement {
  CurrentLine: string = "";
}

//tagType을 HTML 태그에 매핑하는 역할을 수행하는 클래스(단일 책임 원칙)
class TagTypeToHtml {
  private readonly tagType: Map<TagType, string> = new Map<TagType, string>();
  constructor() {
    this.tagType.set(TagType.Paragraph, "p");
    this.tagType.set(TagType.Header1, "h1");
    this.tagType.set(TagType.Header2, "h2");
    this.tagType.set(TagType.Header3, "h3");
    this.tagType.set(TagType.Header4, "h4");
    this.tagType.set(TagType.Header5, "h5");
    this.tagType.set(TagType.Header6, "h6");
    this.tagType.set(TagType.Underscore, "u");
    this.tagType.set(TagType.Emphasize, "em");
    this.tagType.set(TagType.Strong, "strong");
    this.tagType.set(TagType.Link, "a");
    this.tagType.set(TagType.HorizontalRule, "hr");
  }

  public OpeningTag(tagType: TagType): string {
    return this.GetTag(tagType, `<`);
  }

  public ClosingTag(tagType: TagType): string {
    return this.GetTag(tagType, `</`);
  }

  private GetTag(tagType: TagType, openingTagPattern: string): string {
    let tag = this.tagType.get(tagType);
    if (tag !== null) {
      return `${openingTagPattern}${tag}>`;
    }
    return `${openingTagPattern}p>`;
  }
}

class ParagraphVisitor extends VisitorBase {
  constructor() {
    super(TagType.Paragraph, new TagTypeToHtml());
  }
}

class Header1Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header1, new TagTypeToHtml());
  }
}

class Header2Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header2, new TagTypeToHtml());
  }
}

class Header3Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header3, new TagTypeToHtml());
  }
}

class Header4Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header4, new TagTypeToHtml());
  }
}

class Header5Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header5, new TagTypeToHtml());
  }
}

class Header6Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header6, new TagTypeToHtml());
  }
}

class UnderscoreVisitor extends VisitorBase {
  constructor() {
    super(TagType.Underscore, new TagTypeToHtml());
  }
}

class EmphasizeVisitor extends VisitorBase {
  constructor() {
    super(TagType.Emphasize, new TagTypeToHtml());
  }
}

class StrongVisitor extends VisitorBase {
  constructor() {
    super(TagType.Strong, new TagTypeToHtml());
  }
}

class LinkVisitor extends VisitorBase {
  constructor() {
    super(TagType.Link, new TagTypeToHtml());
  }
}

class HorizontalRuleVisitor extends VisitorBase {
  constructor() {
    super(TagType.HorizontalRule, new TagTypeToHtml());
  }
}

class Markdown {
  public ToHtml(text: string): string {
    let document: IMarkdownDocument = new MarkdownDocument();
    let header1: Header1ChainHandler = new ChainOfResponsibilityFactory().Build(
      document
    );
    let lines: string[] = text.split(`\n`);
    for (let i = 0; i < lines.length; i++) {
      let parseElement: ParseElement = new ParseElement();
      parseElement.CurrentLine = lines[i];
      header1.HandleRequest(parseElement);
    }

    return document.Get();
  }
}

class HtmlHandler {
  private markdownChange: Markdown = new Markdown();
  public TextChangeHandler(id: string, output: string): void {
    let markdown = <HTMLTextAreaElement>document.getElementById(id);
    let markdownOutput = <HTMLLabelElement>document.getElementById(output);
    if (markdown !== null) {
      //키보드 이벤트가 발생하면 텍스트 영역의 내용을 확인 후 그 내용대로 레이블의 innerHTML 설정
      markdown.onkeyup = (e) => {
        this.RenderHtmlContent(markdown, markdownOutput);
      };
      window.onload = (e: Event) => {
        this.RenderHtmlContent(markdown, markdownOutput);
      };
    }
  }

  private RenderHtmlContent(
    markdown: HTMLTextAreaElement,
    markdownOutput: HTMLLabelElement
  ) {
    if (markdown.value)
      markdownOutput.innerHTML = this.markdownChange.ToHtml(markdown.value);
    else markdownOutput.innerHTML = "<p></p>";
  }
}
