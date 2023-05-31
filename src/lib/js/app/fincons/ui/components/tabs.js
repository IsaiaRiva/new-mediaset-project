import { C } from '../../share/constants.js';
import { getElmString, wrapInto } from '../logic/elm-creation.js';
import { getStatTab, getUseCaseTab, getNavPills } from '../logic/selectors.js';
import { createFirstGraph } from './use-cases/first.js';

export const fgTabs = () => {
	const ST = getStatTab();
	const navPills = getNavPills();
	if (navPills) {
		return;
	}
	const dropdown = C.dropDownData.options
		.map(v => {
			const link = wrapInto({
				elmTag: 'button',
				classes: ['dropdown-item'],
				content: v.label,
				att: { 'use-case': `${v.value}` },
				type: 'button',
			});
			return `${getElmString(link)}`;
		})
		.join('');

	const tabs = `<ul class="nav nav-pills">
    <li class="nav-item">
      ${getElmString(
				wrapInto({
					id: 'default-btn',
					classes: ['btn', 'btn-info'],
					content: 'default',
					type: 'button',
				})
			)}
    </li>
    <li class="nav-item">
      <div class="btn-group ml-2">
        <button type="button" class="btn btn-danger">use cases</button>
        <button class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu" id="fs-dropdown-menu">
          ${dropdown} 
        </div>
      </div>
    </li>
  </ul>`;

	ST.insertAdjacentHTML(
		'beforebegin',
		getElmString(
			wrapInto({
				classes: ['col-12', 'p-3', 'ml-4'],
				content: tabs,
			})
		)
	);

	$('.dropdown-toggle').dropdown();

	const dropdownElementList = document.getElementById('fs-dropdown-menu');
	const defaultBtn = document.getElementById('default-btn');

	dropdownElementList.addEventListener('click', e => {
		getStatTab()?.classList.add('d-none');
		getUseCaseTab()?.classList.remove('d-none');

		switch (e.target.getAttribute('use-case')) {
			case '1':
				createFirstGraph({ useCase: e.target.getAttribute('use-case') });
				break;
			default:
				console.log(
					`🧊 ~ uses case selected but not bind yet:`,
					e.target.getAttribute('use-case')
				);
		}
	});

	defaultBtn.addEventListener('click', () => {
		getStatTab()?.classList.remove('d-none');
		getUseCaseTab()?.classList.add('d-none');
	});
};
