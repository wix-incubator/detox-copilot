function isElementHidden(el: Element): boolean {
    const style = window.getComputedStyle(el);
    return style.display === 'none' ||
        style.visibility === 'hidden' ||
        el.hasAttribute('hidden');
}

export default isElementHidden;
