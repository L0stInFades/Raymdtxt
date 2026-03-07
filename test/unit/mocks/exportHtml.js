const getSanitizeHtml = (markdown) => markdown

class ExportHtml {
  constructor(markdown) {
    this.markdown = markdown
  }

  generate() {
    return this.markdown
  }

  renderHtml() {
    return this.markdown
  }
}

export { getSanitizeHtml }

export default ExportHtml
