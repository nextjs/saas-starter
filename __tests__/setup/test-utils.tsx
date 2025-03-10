import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Custom render function with providers
function customRender(ui: React.ReactElement, options = {}) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      // wrap provider(s) here if needed
      ...options,
    }),
  };
}

export * from '@testing-library/react';
export { customRender as render }; 