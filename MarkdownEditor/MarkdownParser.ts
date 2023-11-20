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

//tagType을 HTML 태그에 매핑하는 단일 책임 원칙을 지킴
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
