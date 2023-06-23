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
	const dropdownLink = map(C.useCaseExternal.options);

	const tabs = `<ul class="nav nav-pills">
    <li class="nav-item">
      <div class="btn-group ml-2">
        <button type="button" id="dropdown-uc-label" class="btn btn-danger">Use Cases</button>
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
        <button type="button" class="btn btn-info" id="dropdown-client-label">Amazon</button>
        <button class="btn btn-info dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu" id="fs-dropdown-menu-service">
          ${dropdownClients} 
        </div>
      </div>
    </li>
    <li class="nav-item d-none" id="dropdown-link">
      <div class="btn-group ml-2">
        <button type="button" class="btn btn-info" id="dropdown-link-label">Links</button>
        <button class="btn btn-info dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu" id="fs-dropdown-menu-service">
          ${dropdownLink} 
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
	const dropdownUSLabel = document.getElementById('dropdown-uc-label');
	const dropdownClientLabel = document.getElementById('dropdown-client-label');
	const dropdownLinkHTML = document.getElementById('dropdown-link');

	// get default menu index
	const getIndex = value => {
		const index = Array.from(defaultMenu.childNodes)
			.map(n => n.outerText)
			.map((n, i) => {
				if (n.includes(value)) {
					return i;
				}
				return null;
			})
			.filter(n => n !== null)[0];
		console.log(`🧊 ~ index: `, index);
		return index;
	};

	// us listener
	dropdownElementListUS?.addEventListener('click', ({ target }) => {
		const us = target.getAttribute('use-case');
		dropdownClientsItem.classList.add('d-none');
		dropdownLinkHTML.classList.add('d-none');
		dropdownUSLabel.innerText = target.innerText;
		console.log(`🧊 ~ target: `, target);

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
					dropdownClientLabel.innerText = 'Amazon';
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
				defaultMenu.childNodes[
					getIndex('Custom label (Medias...)')
				]?.childNodes[0].click();
				break;
			case '3':
				getStatTab()?.classList.add('d-none');
				getUseCaseTab()?.classList.remove('d-none');
				removeIntoUserCaseTab();
				dropdownLinkHTML.classList.remove('d-none');
				break;
			case '4':
				getStatTab()?.classList.remove('d-none');
				getUseCaseTab()?.classList.add('d-none');
				defaultMenu.childNodes[getIndex('Celebrity')]?.childNodes[0].click();
				break;
			case '8':
				getStatTab()?.classList.remove('d-none');
				getUseCaseTab()?.classList.add('d-none');
				defaultMenu.childNodes[getIndex('Label')]?.childNodes[0].click();
				break;
			case '9':
				getStatTab()?.classList.add('d-none');
				getUseCaseTab()?.classList.remove('d-none');
				createFirstGraph({ useCase: us, client: 'AdvInsertion' });
				break;
			default:
				console.log(`🧊 ~ uses case selected but not bind yet:`, us);
		}
	});

	// client listener
	dropdownElementListService?.addEventListener('click', ({ target }) => {
		const client = target.getAttribute('use-case');
		dropdownClientLabel.innerText = target.innerText;
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
			client: C.serviceDropDown.options[client - 1]?.label,
		});
	});
	dropdownLinkHTML?.addEventListener('click', ({ target }) => {
		const link = target.getAttribute('use-case');
		window.open(C.useCaseExternal.options[link].link, '_blank');
	});
};
