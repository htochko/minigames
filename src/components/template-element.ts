interface TemplateElementConfig {
  selector: string;
  template?: string;
  style?: string;
  shadow?: boolean;
  extends?: keyof HTMLElementTagNameMap;
}

const validateSelector = (selector: string) => {
  if (selector.indexOf('-') <= 0) {
    throw new Error('The selector must contain a hyphen (-)');
  }
};

export default function TemplateElement(config: TemplateElementConfig) {
  validateSelector(config.selector);
}
