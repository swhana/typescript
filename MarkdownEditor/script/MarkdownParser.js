"use strict";
var TagType;
(function (TagType) {
    TagType[TagType["Paragraph"] = 0] = "Paragraph";
    TagType[TagType["Header1"] = 1] = "Header1";
    TagType[TagType["Header2"] = 2] = "Header2";
    TagType[TagType["Header3"] = 3] = "Header3";
    TagType[TagType["Header4"] = 4] = "Header4";
    TagType[TagType["Header5"] = 5] = "Header5";
    TagType[TagType["Header6"] = 6] = "Header6";
    TagType[TagType["Underscore"] = 7] = "Underscore";
    TagType[TagType["Emphasize"] = 8] = "Emphasize";
    TagType[TagType["Strong"] = 9] = "Strong";
    TagType[TagType["Link"] = 10] = "Link";
    TagType[TagType["HorizontalRule"] = 11] = "HorizontalRule";
})(TagType || (TagType = {}));
class VisitorBase {
    constructor(tagType, TagTypeToHtml) {
        this.tagType = tagType;
        this.TagTypeToHtml = TagTypeToHtml;
    }
    Visit(token, markdownDocument) {
        markdownDocument.Add(this.TagTypeToHtml.OpeningTag(this.tagType), token.CurrentLine, this.TagTypeToHtml.ClosingTag(this.tagType));
    }
}
class Handler {
    constructor() {
        this.next = null;
    }
    SetNext(next) {
        this.next = next;
    }
    HandleRequest(request) {
        if (!this.CanHandle(request)) {
            if (this.next !== null) {
                this.next.HandleRequest(request); //다음 클래스로 요청 처리 넘기기
            }
            return;
        }
    }
}
class LineParser {
    Parse(value, tag) {
        let output = [false, ""];
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
class ParseChainHandler extends Handler {
    CanHandle(request) {
        let split = new LineParser().Parse(request.CurrentLine, this.tagType);
        if (split[0]) {
            request.CurrentLine = split[1];
            this.visitable.Accept(this.visitor, request, this.document);
        }
        return split[0];
    }
    constructor(document, tagType, visitor) {
        super();
        this.document = document;
        this.tagType = tagType;
        this.visitor = visitor;
        this.visitable = new Visitable();
    }
}
class ParagraphHandler extends Handler {
    CanHandle(request) {
        this.visitable.Accept(this.visitor, request, this.document);
        return true;
    }
    constructor(document) {
        super();
        this.document = document;
        this.visitable = new Visitable();
        this.visitor = new ParagraphVisitor();
    }
}
//핸들러 구현체
class Header1ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "# ", new Header1Visitor());
    }
}
class Header2ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "## ", new Header2Visitor());
    }
}
class Header3ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "### ", new Header3Visitor());
    }
}
class Header4ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "#### ", new Header4Visitor());
    }
}
class Header5ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "##### ", new Header5Visitor());
    }
}
class Header6ChainHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "###### ", new Header6Visitor());
    }
}
class HorizontalRuleHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "---", new HorizontalRuleVisitor());
    }
}
class EmphasizeHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "* ", new EmphasizeVisitor());
    }
}
class StrongHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "** ", new StrongVisitor());
    }
}
class LinkHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "! ", new LinkVisitor());
    }
}
class UnderscoreHandler extends ParseChainHandler {
    constructor(document) {
        super(document, "~~ ", new UnderscoreVisitor());
    }
}
//방문자 패턴과 연결 책임 권한 패턴 연결하는 클래스
class ChainOfResponsibilityFactory {
    Build(document) {
        let header1 = new Header1ChainHandler(document);
        let header2 = new Header2ChainHandler(document);
        let header3 = new Header3ChainHandler(document);
        let header4 = new Header4ChainHandler(document);
        let header5 = new Header5ChainHandler(document);
        let header6 = new Header6ChainHandler(document);
        let horizontalRule = new HorizontalRuleHandler(document);
        let paragraph = new ParagraphHandler(document);
        let emphasize = new EmphasizeHandler(document);
        let strong = new StrongHandler(document);
        let link = new LinkHandler(document);
        let underscore = new UnderscoreHandler(document);
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
class Visitable {
    Accept(visitor, token, markdownDocument) {
        visitor.Visit(token, markdownDocument);
    }
}
//content 업데이트만을 수행하는 클래스(단일 책임 원칙)
class MarkdownDocument {
    constructor() {
        this.content = "";
    }
    Add(...content) {
        content.forEach((element) => {
            this.content += element;
        });
    }
    Get() {
        return this.content;
    }
}
//현재 파싱 처리 중인 줄을 표시하는 클래스
class ParseElement {
    constructor() {
        this.CurrentLine = "";
    }
}
//tagType을 HTML 태그에 매핑하는 역할을 수행하는 클래스(단일 책임 원칙)
class TagTypeToHtml {
    constructor() {
        this.tagType = new Map();
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
    OpeningTag(tagType) {
        return this.GetTag(tagType, `<`);
    }
    ClosingTag(tagType) {
        return this.GetTag(tagType, `</`);
    }
    GetTag(tagType, openingTagPattern) {
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
    ToHtml(text) {
        let document = new MarkdownDocument();
        let header1 = new ChainOfResponsibilityFactory().Build(document);
        let lines = text.split(`\n`);
        for (let i = 0; i < lines.length; i++) {
            let parseElement = new ParseElement();
            parseElement.CurrentLine = lines[i];
            header1.HandleRequest(parseElement);
        }
        return document.Get();
    }
}
class HtmlHandler {
    constructor() {
        this.markdownChange = new Markdown();
    }
    TextChangeHandler(id, output) {
        let markdown = document.getElementById(id);
        let markdownOutput = document.getElementById(output);
        if (markdown !== null) {
            //키보드 이벤트가 발생하면 텍스트 영역의 내용을 확인 후 그 내용대로 레이블의 innerHTML 설정
            markdown.onkeyup = (e) => {
                this.RenderHtmlContent(markdown, markdownOutput);
            };
            window.onload = (e) => {
                this.RenderHtmlContent(markdown, markdownOutput);
            };
        }
    }
    RenderHtmlContent(markdown, markdownOutput) {
        if (markdown.value)
            markdownOutput.innerHTML = this.markdownChange.ToHtml(markdown.value);
        else
            markdownOutput.innerHTML = "<p></p>";
    }
}
//# sourceMappingURL=MarkdownParser.js.map