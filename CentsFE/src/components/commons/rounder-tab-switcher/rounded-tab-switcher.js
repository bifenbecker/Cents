import React from 'react';

const RoundedTabSwitcher = ({ className, setActiveRoundedTab, roundedTabs, activeRoundedTab }) => (
	<div className={`rounded-tab-switcher-container ${className}`}>
		{roundedTabs.map((tab, index) => {
			let position = null;
			if (index === 0) {
				position = 'first-tab';
			} else if (index === roundedTabs.length - 1) {
				position = 'last-tab';
			}
			return (
				<div
					key={`tab-${tab.value}`}
					className={`${position} rounded-tab ${className} ${activeRoundedTab === tab.value && 'active'}`}
					onClick={() => {
						setActiveRoundedTab(tab.value);
					}}
				>
					{tab.label}
				</div>
			);
		})}
	</div>
);

export default RoundedTabSwitcher;
