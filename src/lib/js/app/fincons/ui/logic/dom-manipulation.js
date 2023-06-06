import { getUseCaseTab } from './selectors.js';

export const insertIntoUserCaseTab = (content) => {
  const elm = getUseCaseTab() 
  elm.appendChild(content);
}

export const removeIntoUserCaseTab = () => {
  const elm = getUseCaseTab() 
  elm.innerHTML = '';
}