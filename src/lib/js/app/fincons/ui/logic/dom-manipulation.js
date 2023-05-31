import { getUseCaseTab } from './selectors.js';

export const insertIntoUserCaseTab = (content) => {
  const elm = getUseCaseTab() 
  elm.appendChild(content);
}