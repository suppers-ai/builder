import { actionComponentsMetadata } from "./action/metadata.tsx";
import { authComponentsMetadata } from "./auth/metadata.tsx";
import { displayComponentsMetadata } from "./display/metadata.tsx";
import { feedbackComponentsMetadata } from "./feedback/metadata.tsx";
import { inputComponentsMetadata } from "./input/metadata.tsx";
import { layoutComponentsMetadata } from "./layout/metadata.tsx";
import { mockupComponentsMetadata } from "./mockup/metadata.tsx";
import { navigationComponentsMetadata } from "./navigation/metadata.tsx";
import { pageComponentsMetadata } from "./page/metadata.tsx";
import { sectionComponentsMetadata } from "./sections/metadata.tsx";

export const componentsMetadata = {
  action: actionComponentsMetadata,
  auth: authComponentsMetadata,
  display: displayComponentsMetadata,
  feedback: feedbackComponentsMetadata,
  input: inputComponentsMetadata,
  layout: layoutComponentsMetadata,
  mockup: mockupComponentsMetadata,
  navigation: navigationComponentsMetadata,
  page: pageComponentsMetadata,
  sections: sectionComponentsMetadata,
};

export const flatComponentsMetadata = Object.values(componentsMetadata).flat();
