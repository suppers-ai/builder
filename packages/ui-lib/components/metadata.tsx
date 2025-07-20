import { actionComponentsMetadata } from "./action/metadata.tsx";
import { displayComponentsMetadata } from "./display/metadata.tsx";
import { feedbackComponentsMetadata } from "./feedback/metadata.tsx";
import { inputComponentsMetadata } from "./input/metadata.tsx";
import { layoutComponentsMetadata } from "./layout/metadata.tsx";
import { mockupComponentsMetadata } from "./mockup/metadata.tsx";
import { navigationComponentsMetadata } from "./navigation/metadata.tsx";
import { pageComponentsMetadata } from "./page/metadata.tsx";
import { sectionComponentsMetadata } from "./sections/metadata.tsx";
import { templateComponentsMetadata } from "./templates/metadata.tsx";

export const allComponentsMetadata = {
    action: actionComponentsMetadata,
    display: displayComponentsMetadata,
    feedback: feedbackComponentsMetadata,
    input: inputComponentsMetadata,
    layout: layoutComponentsMetadata,
    mockup: mockupComponentsMetadata,
    navigation: navigationComponentsMetadata,
    page: pageComponentsMetadata,
    sections: sectionComponentsMetadata,
    templates: templateComponentsMetadata,
};

export const flatComponentsMetadata = [
    ...actionComponentsMetadata,
    ...displayComponentsMetadata,
    ...feedbackComponentsMetadata,
    ...inputComponentsMetadata,
    ...layoutComponentsMetadata,
    ...mockupComponentsMetadata,
    ...navigationComponentsMetadata,
    ...pageComponentsMetadata,
    ...sectionComponentsMetadata,
    ...templateComponentsMetadata,
];

export {
    actionComponentsMetadata,
    displayComponentsMetadata,
    feedbackComponentsMetadata,
    inputComponentsMetadata,
    layoutComponentsMetadata,
    mockupComponentsMetadata,
    navigationComponentsMetadata,
    pageComponentsMetadata,
    sectionComponentsMetadata,
    templateComponentsMetadata,
};