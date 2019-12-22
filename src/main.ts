/// <reference path="../node_modules/@types/knockout/index.d.ts" />

import { load, IServiceIndex } from './serviceIndex'
import { CatalogPoller } from './catalogPoller'
import { CatalogPageProcessor } from './catalogPageProcessor';
import { viewState } from './viewState';
import { RegistrationPoller } from './registrationPoller';

window.addEventListener("DOMContentLoaded", event => {
    let catalogPoller: CatalogPoller;
    let registrationPoller: RegistrationPoller;
    let pageProcessor: CatalogPageProcessor;
    load("https://api.nuget.org/v3/index.json", onServiceIndexLoad, (status, error) => console.log(status));

    function onServiceIndexLoad(serviceIndex: IServiceIndex): void {
        let catalogResource = serviceIndex.resources.filter(e => e["@type"] === "Catalog/3.0.0")[0];
        let registrationBase = serviceIndex.resources.filter(e => e["@type"] === "RegistrationsBaseUrl/3.6.0")[0];

        registrationPoller = new RegistrationPoller(registrationBase["@id"]);
        pageProcessor = new CatalogPageProcessor((pageItem, pkg) => registrationPoller.add(pageItem, pkg));
        catalogPoller = new CatalogPoller(catalogResource["@id"], 30000, page => pageProcessor.processCatalogPage(page));
    }

    function refreshTimeAgo(): void {
        viewState.now(new Date());
    }

    ko.applyBindings(viewState, document.getElementById("nuget-container"));
    let koTimeAgoIntervalId = window.setInterval(refreshTimeAgo, 10000);
});

