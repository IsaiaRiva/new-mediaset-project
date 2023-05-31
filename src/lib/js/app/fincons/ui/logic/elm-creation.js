export const getElmString = (elm) => elm.outerHTML 

export const wrapInto = ({ elmTag = 'div', content, classes = [], id = '', type = '', att = null}) => {
  const elm = document.createElement(elmTag);
  classes.forEach(c => elm.classList.add(c))
  id && (elm.id = id);
  type && (elm.type = type);
  if(att) {
    Object.keys(att).forEach(v => elm.setAttribute(v, att[v]))
  }
  elm.innerHTML =`${content}`
  return elm;
}

// export const createLink = ({classes = [], id = '', content, href = 'javascript:void(0)'}) => {
//   const link = wrapInto({elmTag: 'a', classes, id, content});
//   link.href = href;
//   return link
// }

