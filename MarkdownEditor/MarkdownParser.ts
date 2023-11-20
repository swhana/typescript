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

class HtmlHandler {
  public TextChangeHandler(id: string, output: string): void {
    let markdown = <HTMLTextAreaElement>document.getElementById(id);
    let markdownOutput = <HTMLLabelElement>document.getElementById(output);
    if (markdown !== null) {
      //키보드 이벤트가 발생하면 텍스트 영역의 내용을 확인 후 그 내용대로 레이블의 innerHTML 설정
      markdown.onkeyup = (e) => {
        if (markdown.value) markdownOutput.innerHTML = markdown.value;
        else markdownOutput.innerHTML = "<p></p>";
      };
    }
  }
}
