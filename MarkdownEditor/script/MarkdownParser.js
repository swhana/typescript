"use strict";
class HtmlHandler {
    TextChangeHandler(id, output) {
        let markdown = document.getElementById(id);
        let markdownOutput = document.getElementById(output);
        if (markdown !== null) {
            //키보드 이벤트가 발생하면 텍스트 영역의 내용을 확인 후 그 내용대로 레이블의 innerHTML 설정
            markdown.onkeyup = (e) => {
                if (markdown.value)
                    markdownOutput.innerHTML = markdown.value;
                else
                    markdownOutput.innerHTML = "<p></p>";
            };
        }
    }
}
//# sourceMappingURL=MarkdownParser.js.map