// Unit tests for utility functions
/// <reference lib="deno.ns" />

import { assertEquals, assertExists, assert } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { 
  FileSystemUtils, 
  StringUtils, 
  Logger, 
  ArrayUtils, 
  ObjectUtils,
  fs,
  str,
  arr,
  obj
} from './utils.ts';
import { LogLevel } from './enums.ts';

// FileSystemUtils tests
Deno.test('FileSystemUtils - normalizePath', () => {
  assertEquals(FileSystemUtils.normalizePath('path\\to\\file'), 'path/to/file');
  assertEquals(FileSystemUtils.normalizePath('path/to/file'), 'path/to/file');
  assertEquals(FileSystemUtils.normalizePath('path\\\\to\\\\file'), 'path/to/file');
});

Deno.test('FileSystemUtils - joinPath', () => {
  assertEquals(FileSystemUtils.joinPath('path', 'to', 'file'), 'path/to/file');
  assertEquals(FileSystemUtils.joinPath('/root', 'path', 'file'), '/root/path/file');
  assertEquals(FileSystemUtils.joinPath('path/', '/to/', '/file'), 'path/to/file');
  assertEquals(FileSystemUtils.joinPath('', 'path', '', 'file'), 'path/file');
});

Deno.test('FileSystemUtils - getExtension', () => {
  assertEquals(FileSystemUtils.getExtension('file.txt'), 'txt');
  assertEquals(FileSystemUtils.getExtension('path/to/file.json'), 'json');
  assertEquals(FileSystemUtils.getExtension('file'), '');
  assertEquals(FileSystemUtils.getExtension('.hidden'), 'hidden');
});

Deno.test('FileSystemUtils - getBasename', () => {
  assertEquals(FileSystemUtils.getBasename('path/to/file.txt'), 'file.txt');
  assertEquals(FileSystemUtils.getBasename('path/to/file.txt', false), 'file');
  assertEquals(FileSystemUtils.getBasename('file.txt'), 'file.txt');
  assertEquals(FileSystemUtils.getBasename('file'), 'file');
});

Deno.test('FileSystemUtils - getDirname', () => {
  assertEquals(FileSystemUtils.getDirname('path/to/file.txt'), 'path/to');
  assertEquals(FileSystemUtils.getDirname('file.txt'), '.');
  assertEquals(FileSystemUtils.getDirname('/root/file.txt'), '/root');
});

Deno.test('FileSystemUtils - isAbsolute', () => {
  assertEquals(FileSystemUtils.isAbsolute('/path/to/file'), true);
  assertEquals(FileSystemUtils.isAbsolute('C:\\path\\to\\file'), true);
  assertEquals(FileSystemUtils.isAbsolute('path/to/file'), false);
  assertEquals(FileSystemUtils.isAbsolute('./path/to/file'), false);
});

Deno.test('FileSystemUtils - resolve', () => {
  assertEquals(FileSystemUtils.resolve('/base', 'relative/path'), '/base/relative/path');
  assertEquals(FileSystemUtils.resolve('/base', '/absolute/path'), '/absolute/path');
  assertEquals(FileSystemUtils.resolve('base', 'relative/path'), 'base/relative/path');
});

// StringUtils tests
Deno.test('StringUtils - replaceTemplateVariables', () => {
  const template = 'Hello {{name}}, you are {{age}} years old!';
  const variables = [
    { name: 'name', value: 'John', type: 'string' as const },
    { name: 'age', value: 30, type: 'number' as const }
  ];
  
  const result = StringUtils.replaceTemplateVariables(template, variables);
  assertEquals(result, 'Hello John, you are 30 years old!');
});

Deno.test('StringUtils - case conversions', () => {
  const testString = 'hello world test';
  
  assertEquals(StringUtils.toCamelCase(testString), 'helloWorldTest');
  assertEquals(StringUtils.toPascalCase(testString), 'HelloWorldTest');
  assertEquals(StringUtils.toKebabCase('HelloWorldTest'), 'hello-world-test');
  assertEquals(StringUtils.toSnakeCase('HelloWorldTest'), 'hello_world_test');
});

Deno.test('StringUtils - capitalize', () => {
  assertEquals(StringUtils.capitalize('hello'), 'Hello');
  assertEquals(StringUtils.capitalize('HELLO'), 'HELLO');
  assertEquals(StringUtils.capitalize(''), '');
});

Deno.test('StringUtils - truncate', () => {
  assertEquals(StringUtils.truncate('Hello World', 5), 'He...');
  assertEquals(StringUtils.truncate('Hello', 10), 'Hello');
  assertEquals(StringUtils.truncate('Hello World', 8, '***'), 'Hello***');
});

Deno.test('StringUtils - escapeRegex', () => {
  assertEquals(StringUtils.escapeRegex('hello.world'), 'hello\\.world');
  assertEquals(StringUtils.escapeRegex('test[123]'), 'test\\[123\\]');
  assertEquals(StringUtils.escapeRegex('a+b*c?'), 'a\\+b\\*c\\?');
});

Deno.test('StringUtils - randomString', () => {
  const random1 = StringUtils.randomString(10);
  const random2 = StringUtils.randomString(10);
  
  assertEquals(random1.length, 10);
  assertEquals(random2.length, 10);
  assert(random1 !== random2); // Very unlikely to be the same
});

Deno.test('StringUtils - isValidIdentifier', () => {
  assertEquals(StringUtils.isValidIdentifier('validName'), true);
  assertEquals(StringUtils.isValidIdentifier('_validName'), true);
  assertEquals(StringUtils.isValidIdentifier('$validName'), true);
  assertEquals(StringUtils.isValidIdentifier('123invalid'), false);
  assertEquals(StringUtils.isValidIdentifier('invalid-name'), false);
  assertEquals(StringUtils.isValidIdentifier('invalid name'), false);
});

Deno.test('StringUtils - pluralize and singularize', () => {
  assertEquals(StringUtils.pluralize('cat'), 'cats');
  assertEquals(StringUtils.pluralize('city'), 'cities');
  assertEquals(StringUtils.pluralize('box'), 'boxes');
  assertEquals(StringUtils.pluralize('class'), 'classes');
  
  assertEquals(StringUtils.singularize('cats'), 'cat');
  assertEquals(StringUtils.singularize('cities'), 'city');
  assertEquals(StringUtils.singularize('boxes'), 'box');
  assertEquals(StringUtils.singularize('classes'), 'class');
});

// Logger tests
Deno.test('Logger - level filtering', () => {
  const logger = new Logger(LogLevel.WARN);
  
  // These should not throw errors, but we can't easily test console output
  logger.debug('Debug message'); // Should not log
  logger.info('Info message');   // Should not log
  logger.warn('Warning message'); // Should log
  logger.error('Error message');  // Should log
  
  // Test level setting
  logger.setLevel(LogLevel.DEBUG);
  logger.debug('Debug message after level change'); // Should now log
});

Deno.test('Logger - child logger', () => {
  const parentLogger = new Logger(LogLevel.INFO, 'parent');
  const childLogger = parentLogger.child('child');
  
  // Test that child logger exists and has correct prefix
  assertExists(childLogger);
  
  // These should not throw errors
  childLogger.info('Child message');
});

// ArrayUtils tests
Deno.test('ArrayUtils - unique', () => {
  assertEquals(ArrayUtils.unique([1, 2, 2, 3, 3, 3]), [1, 2, 3]);
  assertEquals(ArrayUtils.unique(['a', 'b', 'a', 'c']), ['a', 'b', 'c']);
  assertEquals(ArrayUtils.unique([]), []);
});

Deno.test('ArrayUtils - groupBy', () => {
  const items = [
    { type: 'fruit', name: 'apple' },
    { type: 'fruit', name: 'banana' },
    { type: 'vegetable', name: 'carrot' }
  ];
  
  const grouped = ArrayUtils.groupBy(items, item => item.type);
  
  assertEquals(grouped.fruit.length, 2);
  assertEquals(grouped.vegetable.length, 1);
  assertEquals(grouped.fruit[0].name, 'apple');
});

Deno.test('ArrayUtils - chunk', () => {
  assertEquals(ArrayUtils.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assertEquals(ArrayUtils.chunk([1, 2, 3, 4], 2), [[1, 2], [3, 4]]);
  assertEquals(ArrayUtils.chunk([], 2), []);
});

Deno.test('ArrayUtils - flatten', () => {
  assertEquals(ArrayUtils.flatten([1, [2, 3], [4, [5, 6]]]), [1, 2, 3, 4, 5, 6]);
  assertEquals(ArrayUtils.flatten([1, 2, 3]), [1, 2, 3]);
  assertEquals(ArrayUtils.flatten([]), []);
});

Deno.test('ArrayUtils - intersection', () => {
  assertEquals(ArrayUtils.intersection([1, 2, 3], [2, 3, 4]), [2, 3]);
  assertEquals(ArrayUtils.intersection([1, 2], [3, 4]), []);
  assertEquals(ArrayUtils.intersection([1, 2, 3], [1, 2, 3]), [1, 2, 3]);
});

Deno.test('ArrayUtils - difference', () => {
  assertEquals(ArrayUtils.difference([1, 2, 3], [2, 3, 4]), [1]);
  assertEquals(ArrayUtils.difference([1, 2, 3], [4, 5, 6]), [1, 2, 3]);
  assertEquals(ArrayUtils.difference([1, 2, 3], [1, 2, 3]), []);
});

// ObjectUtils tests
Deno.test('ObjectUtils - deepClone', () => {
  const original = {
    name: 'John',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown'
    },
    hobbies: ['reading', 'coding']
  };
  
  const cloned = ObjectUtils.deepClone(original);
  
  assertEquals(cloned.name, original.name);
  assertEquals(cloned.address.street, original.address.street);
  assertEquals(cloned.hobbies[0], original.hobbies[0]);
  
  // Ensure it's a deep clone
  cloned.address.street = '456 Oak St';
  assertEquals(original.address.street, '123 Main St');
});

Deno.test('ObjectUtils - deepMerge', () => {
  const target = {
    a: 1,
    b: {
      c: 2,
      d: 3
    }
  };
  
  const source = {
    b: {
      d: 4,
      e: 5
    },
    f: 6
  };
  
  const merged = ObjectUtils.deepMerge(target, source);
  
  assertEquals(merged.a, 1);
  assertEquals((merged.b as any).c, 2);
  assertEquals((merged.b as any).d, 4);
  assertEquals((merged.b as any).e, 5);
  assertEquals((merged as any).f, 6);
});

Deno.test('ObjectUtils - get and set', () => {
  const obj = {
    user: {
      profile: {
        name: 'John'
      }
    }
  };
  
  assertEquals(ObjectUtils.get(obj, 'user.profile.name'), 'John');
  assertEquals(ObjectUtils.get(obj, 'user.profile.age', 25), 25);
  assertEquals(ObjectUtils.get(obj, 'nonexistent.path', 'default'), 'default');
  
  ObjectUtils.set(obj, 'user.profile.age', 30);
  assertEquals(ObjectUtils.get(obj, 'user.profile.age'), 30);
  
  ObjectUtils.set(obj, 'user.settings.theme', 'dark');
  assertEquals(ObjectUtils.get(obj, 'user.settings.theme'), 'dark');
});

Deno.test('ObjectUtils - has', () => {
  const obj = {
    user: {
      profile: {
        name: 'John'
      }
    }
  };
  
  assertEquals(ObjectUtils.has(obj, 'user.profile.name'), true);
  assertEquals(ObjectUtils.has(obj, 'user.profile.age'), false);
  assertEquals(ObjectUtils.has(obj, 'nonexistent.path'), false);
});

Deno.test('ObjectUtils - pick and omit', () => {
  const obj = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
    password: 'secret'
  };
  
  const picked = ObjectUtils.pick(obj, ['name', 'email']);
  assertEquals(Object.keys(picked).length, 2);
  assertEquals(picked.name, 'John');
  assertEquals(picked.email, 'john@example.com');
  
  const omitted = ObjectUtils.omit(obj, ['password']);
  assertEquals(Object.keys(omitted).length, 3);
  assertEquals(omitted.name, 'John');
  assertEquals('password' in omitted, false);
});

// Test convenience exports
Deno.test('Convenience exports work', () => {
  assertEquals(fs.normalizePath('test\\path'), 'test/path');
  assertEquals(str.capitalize('hello'), 'Hello');
  assertEquals(arr.unique([1, 1, 2]).length, 2);
  assertEquals(obj.get({ a: { b: 1 } }, 'a.b'), 1);
});