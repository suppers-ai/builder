// Export types
export type * from "./types.ts";

// Export all display components and their types
export { Toast } from "./feedback/toast/Toast.tsx";
export type { ToastProps } from "./feedback/toast/Toast.tsx";

// Export new authentication and search components
export { LoginButton } from "./action/login-button/LoginButton.tsx";
export type { LoginButtonProps } from "./action/login-button/LoginButton.tsx";
export { SearchButton } from "./action/search-button/SearchButton.tsx";
export type { SearchButtonProps } from "./action/search-button/SearchButton.tsx";
export { SearchModal } from "./action/search-modal/SearchModal.tsx";
export type { SearchModalProps, SearchResult } from "./action/search-modal/SearchModal.tsx";
export { UserProfileDropdown } from "./navigation/user-profile-dropdown/UserProfileDropdown.tsx";
export type {
  UserProfileDropdownProps,
} from "./navigation/user-profile-dropdown/UserProfileDropdown.tsx";
export { Rating } from "./input/rating/Rating.tsx";
export type { RatingProps } from "./input/rating/Rating.tsx";
export { FileInput } from "./input/file-input/FileInput.tsx";
export type { FileInputProps } from "./input/file-input/FileInput.tsx";
export { Carousel, CarouselItem } from "./display/carousel/Carousel.tsx";
export type { CarouselProps, CarouselItemProps } from "./display/carousel/Carousel.tsx";
export { Steps } from "./navigation/steps/Steps.tsx";
export type { StepsProps } from "./navigation/steps/Steps.tsx";
export { Drawer } from "./layout/drawer/Drawer.tsx";
export type { DrawerProps } from "./layout/drawer/Drawer.tsx";
export { Table } from "./display/table/Table.tsx";
export type { TableColumn, TableProps } from "./display/table/Table.tsx";
export { Pagination } from "./navigation/pagination/Pagination.tsx";
export type { PaginationProps } from "./navigation/pagination/Pagination.tsx";
export { Sidebar } from "./navigation/sidebar/Sidebar.tsx";
export type { SidebarProps } from "./navigation/sidebar/Sidebar.tsx";
export { Countdown } from "./display/countdown/Countdown.tsx";
export type { CountdownProps } from "./display/countdown/Countdown.tsx";
export {
  GlobalThemeController,
  ThemeController,
} from "./action/theme-controller/ThemeController.tsx";
export type { ThemeControllerProps } from "./action/theme-controller/ThemeController.tsx";
export { ChatBubble } from "./display/chat-bubble/ChatBubble.tsx";
export type { ChatBubbleProps } from "./display/chat-bubble/ChatBubble.tsx";
export { Stat } from "./display/stat/Stat.tsx";
export type { StatProps } from "./display/stat/Stat.tsx";
export { Dock } from "./navigation/dock/Dock.tsx";
export type { DockItem, DockProps } from "./navigation/dock/Dock.tsx";
export { Link } from "./navigation/link/Link.tsx";
export type { LinkProps } from "./navigation/link/Link.tsx";
export { Hero } from "./layout/hero/Hero.tsx";
export type { HeroProps } from "./layout/hero/Hero.tsx";
export { Footer } from "./layout/footer/Footer.tsx";
export type {
  FooterLink,
  FooterProps,
  FooterSection,
  NewsletterSignup,
  SocialLink,
} from "./layout/footer/Footer.tsx";
export { Join } from "./layout/join/Join.tsx";
export type { JoinProps } from "./layout/join/Join.tsx";
export { Artboard } from "./layout/artboard/Artboard.tsx";
export type { ArtboardProps } from "./layout/artboard/Artboard.tsx";
export { Mask } from "./layout/mask/Mask.tsx";
export type { MaskProps } from "./layout/mask/Mask.tsx";

// Export existing components
export { Alert } from "./feedback/alert/Alert.tsx";
export type { AlertProps } from "./feedback/alert/Alert.tsx";
export { Badge } from "./display/badge/Badge.tsx";
export { Button } from "./action/button/Button.tsx";
export { Card } from "./display/card/Card.tsx";
export { Checkbox } from "./input/checkbox/Checkbox.tsx";
export type { CheckboxProps } from "./input/checkbox/Checkbox.tsx";
export { Collapse } from "./display/collapse/Collapse.tsx";
export type { CollapseProps } from "./display/collapse/Collapse.tsx";
export { Divider } from "./layout/divider/Divider.tsx";
export type { DividerProps } from "./layout/divider/Divider.tsx";
export { Dropdown } from "./action/dropdown/Dropdown.tsx";
export type { DropdownProps } from "./action/dropdown/Dropdown.tsx";
export { Input } from "./input/input/Input.tsx";
export { Loading } from "./feedback/loading/Loading.tsx";
export { Modal } from "./action/modal/Modal.tsx";
export type { ModalProps } from "./action/modal/Modal.tsx";
export { Navbar } from "./navigation/navbar/Navbar.tsx";
export type { NavbarProps } from "./navigation/navbar/Navbar.tsx";
export { Progress } from "./feedback/progress/Progress.tsx";
export { Radio } from "./input/radio/Radio.tsx";
export type { RadioProps } from "./input/radio/Radio.tsx";
export { Range } from "./input/range/Range.tsx";
export type { RangeProps } from "./input/range/Range.tsx";
export { Select } from "./input/select/Select.tsx";
export type { SelectProps } from "./input/select/Select.tsx";
export { Skeleton } from "./feedback/skeleton/Skeleton.tsx";
export { Swap } from "./action/swap/Swap.tsx";
export type { SwapProps } from "./action/swap/Swap.tsx";
export { Tabs } from "./navigation/tabs/Tabs.tsx";
export type { TabProps } from "./navigation/tabs/Tabs.tsx";
export { Textarea } from "./input/textarea/Textarea.tsx";
export type { TextareaProps } from "./input/textarea/Textarea.tsx";
export { Toggle } from "./input/toggle/Toggle.tsx";
export type { ToggleProps } from "./input/toggle/Toggle.tsx";
export { Tooltip } from "./feedback/tooltip/Tooltip.tsx";
export type { TooltipProps } from "./feedback/tooltip/Tooltip.tsx";
export { Accordion } from "./display/accordion/Accordion.tsx";
export type { AccordionProps } from "./display/accordion/Accordion.tsx";
export { Breadcrumbs } from "./navigation/breadcrumbs/Breadcrumbs.tsx";
export type { BreadcrumbsProps } from "./navigation/breadcrumbs/Breadcrumbs.tsx";

// Layout components
export { CleanSidebarLayout } from "./layout/clean-sidebar-layout/CleanSidebarLayout.tsx";
export type { CleanSidebarLayoutProps } from "./layout/clean-sidebar-layout/CleanSidebarLayout.tsx";
export { HeaderLayout } from "./layout/header-layout/HeaderLayout.tsx";
export type { HeaderLayoutProps } from "./layout/header-layout/HeaderLayout.tsx";
export { PageLayout } from "./layout/page-layout/PageLayout.tsx";
export type { PageLayoutProps } from "./layout/page-layout/PageLayout.tsx";

// Page components
export { LoginPage } from "./page/login-page/LoginPage.tsx";
export type { LoginPageProps } from "./page/login-page/LoginPage.tsx";
export { AdminPage } from "./page/admin-page/AdminPage.tsx";
export type { AdminPageProps } from "./page/admin-page/AdminPage.tsx";
export { UserPage } from "./page/user-page/UserPage.tsx";
export type { UserPageProps } from "./page/user-page/UserPage.tsx";
export { EditUserModal, SimpleEditUserModal } from "./page/user-page/index.ts";
export { ApplicationsPage } from "./page/applications-page/ApplicationsPage.tsx";
export type { ApplicationsPageProps } from "./page/applications-page/ApplicationsPage.tsx";
export { HomePage } from "./page/home-page/HomePage.tsx";
export type { HomePageProps } from "./page/home-page/HomePage.tsx";

// Export missing components
export { MainLayout } from "./layout/MainLayout.tsx";
export { BenefitsSection } from "./sections/benefits-section/BenefitsSection.tsx";
export { StatsSection } from "./sections/stats-section/StatsSection.tsx";
export { ComponentPreviewCard } from "./display/ComponentPreviewCard.tsx";
export { Avatar } from "./display/avatar/Avatar.tsx";
export type { AvatarProps } from "./display/avatar/Avatar.tsx";
export { Menu } from "./navigation/menu/Menu.tsx";
export type { MenuProps } from "./navigation/menu/Menu.tsx";
export { Kbd } from "./display/kbd/Kbd.tsx";
export type { KbdProps } from "./display/kbd/Kbd.tsx";
export { Diff } from "./display/diff/Diff.tsx";
export type { DiffProps } from "./display/diff/Diff.tsx";
export { RadialProgress } from "./feedback/radial-progress/RadialProgress.tsx";
export type { RadialProgressProps } from "./feedback/radial-progress/RadialProgress.tsx";
export { Timeline } from "./display/timeline/Timeline.tsx";
export type { TimelineProps } from "./display/timeline/Timeline.tsx";
export { Stack } from "./layout/stack/Stack.tsx";
export type { StackProps } from "./layout/stack/Stack.tsx";
export { Indicator } from "./layout/indicator/Indicator.tsx";
export type { IndicatorProps } from "./layout/indicator/Indicator.tsx";

// Export input components
export { NumberInput } from "./input/number-input/NumberInput.tsx";
export type { NumberInputProps } from "./input/number-input/NumberInput.tsx";
export { DateInput } from "./input/date-input/DateInput.tsx";
export type { DateInputProps } from "./input/date-input/DateInput.tsx";
export { TimeInput } from "./input/time-input/TimeInput.tsx";
export type { TimeInputProps } from "./input/time-input/TimeInput.tsx";
export { EmailInput } from "./input/email-input/EmailInput.tsx";
export type { EmailInputProps } from "./input/email-input/EmailInput.tsx";
export { PasswordInput } from "./input/password-input/PasswordInput.tsx";
export type { PasswordInputProps } from "./input/password-input/PasswordInput.tsx";
export { ColorInput } from "./input/color-input/ColorInput.tsx";
export type { ColorInputProps } from "./input/color-input/ColorInput.tsx";
export { DatetimeInput } from "./input/datetime-input/DatetimeInput.tsx";
export type { DatetimeInputProps } from "./input/datetime-input/DatetimeInput.tsx";

// Export mockup components
export { BrowserMockup } from "./mockup/browser/BrowserMockup.tsx";
export type { BrowserMockupProps } from "./mockup/browser/BrowserMockup.tsx";
export { CodeMockup } from "./mockup/code/CodeMockup.tsx";
export type { CodeMockupProps } from "./mockup/code/CodeMockup.tsx";
export { WindowMockup } from "./mockup/window/WindowMockup.tsx";
export type { WindowMockupProps } from "./mockup/window/WindowMockup.tsx";
export { PhoneMockup } from "./mockup/phone/PhoneMockup.tsx";
export type { PhoneMockupProps } from "./mockup/phone/PhoneMockup.tsx";

// Export types
export type * from "./types.ts";

// Export utilities and configurations
export {
  type SidebarConfig,
  type SidebarLink,
  type SidebarSection,
} from "../../shared/types/sidebar.tsx";

// Export metadata files for docs
export { buttonMetadata } from "./action/button/Button.metadata.tsx";
export { dropdownMetadata } from "./action/dropdown/Dropdown.metadata.tsx";
export { loginButtonMetadata } from "./action/login-button/LoginButton.metadata.tsx";
export { modalMetadata } from "./action/modal/Modal.metadata.tsx";
export { searchButtonMetadata } from "./action/search-button/SearchButton.metadata.tsx";
export { searchModalMetadata } from "./action/search-modal/SearchModal.metadata.tsx";
export { swapMetadata } from "./action/swap/Swap.metadata.tsx";
export { themeControllerMetadata } from "./action/theme-controller/ThemeController.metadata.tsx";
export { accordionMetadata } from "./display/accordion/Accordion.metadata.tsx";
export { avatarMetadata } from "./display/avatar/Avatar.metadata.tsx";
export { badgeMetadata } from "./display/badge/Badge.metadata.tsx";
export { cardMetadata } from "./display/card/Card.metadata.tsx";
export { carouselMetadata } from "./display/carousel/Carousel.metadata.tsx";
export { chatBubbleMetadata } from "./display/chat-bubble/ChatBubble.metadata.tsx";
export { collapseMetadata } from "./display/collapse/Collapse.metadata.tsx";
export { countdownMetadata } from "./display/countdown/Countdown.metadata.tsx";
export { diffMetadata } from "./display/diff/Diff.metadata.tsx";
export { kbdMetadata } from "./display/kbd/Kbd.metadata.tsx";
export { statMetadata } from "./display/stat/Stat.metadata.tsx";
export { tableMetadata } from "./display/table/Table.metadata.tsx";
export { timelineMetadata } from "./display/timeline/Timeline.metadata.tsx";
export { breadcrumbsMetadata } from "./navigation/breadcrumbs/Breadcrumbs.metadata.tsx";
export { dockMetadata } from "./navigation/dock/Dock.metadata.tsx";
export { linkMetadata } from "./navigation/link/Link.metadata.tsx";
export { menuMetadata } from "./navigation/menu/Menu.metadata.tsx";
export { navbarMetadata } from "./navigation/navbar/Navbar.metadata.tsx";
export { paginationMetadata } from "./navigation/pagination/Pagination.metadata.tsx";
export { sidebarMetadata } from "./navigation/sidebar/Sidebar.metadata.tsx";
export { stepsMetadata } from "./navigation/steps/Steps.metadata.tsx";
export { tabsMetadata } from "./navigation/tabs/Tabs.metadata.tsx";
export { checkboxMetadata } from "./input/checkbox/Checkbox.metadata.tsx";
export { dateInputMetadata } from "./input/date-input/DateInput.metadata.tsx";
export { fileInputMetadata } from "./input/file-input/FileInput.metadata.tsx";
export { inputMetadata } from "./input/input/Input.metadata.tsx";
export { passwordInputMetadata } from "./input/password-input/PasswordInput.metadata.tsx";
export { radioMetadata } from "./input/radio/Radio.metadata.tsx";
export { rangeMetadata } from "./input/range/Range.metadata.tsx";
export { ratingMetadata } from "./input/rating/Rating.metadata.tsx";
export { selectMetadata } from "./input/select/Select.metadata.tsx";
export { textareaMetadata } from "./input/textarea/Textarea.metadata.tsx";
export { toggleMetadata } from "./input/toggle/Toggle.metadata.tsx";
export { artboardMetadata } from "./layout/artboard/Artboard.metadata.tsx";
export { dividerMetadata } from "./layout/divider/Divider.metadata.tsx";
export { drawerMetadata } from "./layout/drawer/Drawer.metadata.tsx";
export { footerMetadata } from "./layout/footer/Footer.metadata.tsx";
export { heroMetadata } from "./layout/hero/Hero.metadata.tsx";
export { indicatorMetadata } from "./layout/indicator/Indicator.metadata.tsx";
export { joinMetadata } from "./layout/join/Join.metadata.tsx";
export { maskMetadata } from "./layout/mask/Mask.metadata.tsx";
export { stackMetadata } from "./layout/stack/Stack.metadata.tsx";
export { alertMetadata } from "./feedback/alert/Alert.metadata.tsx";
export { loadingMetadata } from "./feedback/loading/Loading.metadata.tsx";
export { progressMetadata } from "./feedback/progress/Progress.metadata.tsx";
export { radialProgressMetadata } from "./feedback/radial-progress/RadialProgress.metadata.tsx";
export { skeletonMetadata } from "./feedback/skeleton/Skeleton.metadata.tsx";
export { toastMetadata } from "./feedback/toast/Toast.metadata.tsx";
export { tooltipMetadata } from "./feedback/tooltip/Tooltip.metadata.tsx";
export { browserMetadata } from "./mockup/browser/Browser.metadata.tsx";
export { codeMetadata } from "./mockup/code/Code.metadata.tsx";
export { phoneMetadata } from "./mockup/phone/Phone.metadata.tsx";
export { windowMetadata } from "./mockup/window/Window.metadata.tsx";

// Export organized metadata collections
export {
  componentsMetadata,
  flatComponentsMetadata,
} from "./metadata.tsx";
