import { C } from '../../share/constants.js';
import { removeIntoUserCaseTab } from '../logic/dom-manipulation.js';
import { getElmString, wrapInto } from '../logic/elm-creation.js';
import { getStatTab, getUseCaseTab, getNavPills } from '../logic/selectors.js';
import { createFirstGraph } from './use-cases/first.js';

export const fgTabs = () => {
	const ST = getStatTab();
	const navPills = getNavPills();
	if (navPills) {
		return;
	}

	const map = array => {
		return array
			.map(v => {
				const link = wrapInto({
					elmTag: 'button',
					classes: ['dropdown-item', ...v.classes],
					content: v.label,
					att: { 'use-case': `${v.value}` },
					type: 'button',
				});
				return `${getElmString(link)}`;
			})
			.join('');
	};

	const dropdownClients = map(C.serviceDropDown.options);
	const dropdownUS = map(C.dropDownData.options);

	const tabs = `<ul class="nav nav-pills">
    <li class="nav-item">
      <div class="btn-group ml-2">
        <button type="button" class="btn btn-danger">use cases</button>
        <button class="btn btn-danger dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu" id="fs-dropdown-menu-us">
          ${dropdownUS} 
        </div>
      </div>
    </li>
    <li class="nav-item d-none" id="dropdown-clients">
      <div class="btn-group ml-2">
        <button type="button" class="btn btn-info">solutions by</button>
        <button class="btn btn-info dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu" id="fs-dropdown-menu-service">
          ${dropdownClients} 
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
	getStatTab()?.classList.add('d-none'); // hide default tabs

	const dropdownElementListUS = document.getElementById('fs-dropdown-menu-us');
	const dropdownClientsItem = document.getElementById('dropdown-clients');
	const dropdownElementListUSBtns =
		document.querySelectorAll('#fs-dropdown-menu-us button.dropdown-item') || [];
	const dropdownElementListService = document.getElementById(
		'fs-dropdown-menu-service'
	);
	const dropdownElementListServiceBtns =
		document.querySelectorAll('#fs-dropdown-menu-service button.dropdown-item') ||
		[];
	const defaultMenu = document.querySelector('.fs-default-menu');

	dropdownElementListUS?.addEventListener('click', ({ target }) => {
		const us = target.getAttribute('use-case');
		dropdownClientsItem.classList.add('d-none');

		Array.from(dropdownElementListUSBtns).map((x, i) => {
			if (i === us - 1) {
				x.classList.add('active');
				return;
			}
			x.classList.remove('active');
		});

		switch (us) {
			case '1':
				getStatTab()?.classList.add('d-none');
				getUseCaseTab()?.classList.remove('d-none');
				dropdownClientsItem.classList.remove('d-none');
				Array.from(dropdownElementListServiceBtns).map((x, i) => {
					if (i === 0) {
						x.classList.add('active');
						return;
					}
					x.classList.remove('active');
				});
				createFirstGraph({ useCase: us });
				break;
			case '2':
				getStatTab()?.classList.remove('d-none');
				getUseCaseTab()?.classList.add('d-none');
				defaultMenu.childNodes[2].childNodes[0].click();
				break;
			case '3':
				window.open('https://ddiep5hcz5y57.cloudfront.net/', '_blank');
				removeIntoUserCaseTab()
				break;
			case '4':
				getStatTab()?.classList.remove('d-none');
				getUseCaseTab()?.classList.add('d-none');
				defaultMenu.childNodes[5].childNodes[0].click();
				break;
			default:
				console.log(`🧊 ~ uses case selected but not bind yet:`, us);
		}
	});

	dropdownElementListService?.addEventListener('click', ({ target }) => {
		const client = target.getAttribute('use-case');
		Array.from(dropdownElementListServiceBtns).map((x, i) => {
			if (i === client - 1) {
				x.classList.add('active');
				return;
			}
			x.classList.remove('active');
		});

		console.log(`🧊 ~ C.serviceDropDown.options: `, C.serviceDropDown.options);
		console.log(`🧊 ~ C.serviceDropDown.options: `, client - 1);
		createFirstGraph({
			useCase: 1,
			client: C.serviceDropDown.options[client - 1].label,
		});
	});
};
