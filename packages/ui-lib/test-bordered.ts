import { renderToString } from 'preact-render-to-string';
import { Select } from './components/input/select/Select.tsx';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' }
];

// Test with bordered=true (default)
console.log('With bordered=true (default):');
console.log(renderToString(Select({ options, bordered: true })));

// Test with bordered=false
console.log('\nWith bordered=false:');
console.log(renderToString(Select({ options, bordered: false })));

// Test without specifying bordered (should default to true)
console.log('\nWithout specifying bordered:');
console.log(renderToString(Select({ options })));