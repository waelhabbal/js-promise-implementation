# Vow Class Implementation for Promises in JavaScript

The `Vow` class is a simplified implementation of the Promise object in JavaScript that can help you understand how promises work and how to handle asynchronous operations in a standard way. It provides a lightweight and easy-to-understand alternative to the native Promise object that can be used in your own projects or modified to suit your needs.

## Features

- Simplified implementation of the Promise object in JavaScript
- Lightweight and easy-to-understand code
- Full compatibility with the native Promise object
- Several utility functions to work with arrays of promises
- Fully tested codebase

## Getting Started

To use the `Vow` class in your own project, you can simply copy the `vow.js` file into your project directory and import it using the `import` statement:

```js
import Vow from './vow.js';

// Use the Vow class
```

Alternatively, you can clone the repository and run the tests to verify the functionality of the `Vow` class:

```sh
git clone https://github.com/waelhabbal/js-promise-implementation.git
cd js-promise-implementation
npm install
npm test
```

## Usage

The `Vow` class provides a way to handle asynchronous operations in a standard way by following the same principles as the native Promise object. You can create a new vow using the `new` operator and passing a callback function that takes two arguments: `resolve` and `reject`. 

```js
const vow = new Vow((resolve, reject) => {
  // do some asynchronous operation here
  // call resolve(value) if the operation succeeds
  // call reject(reason) if the operation fails
});
```

Once you have a vow, you can attach callbacks to it using the `then()`, `catch()`, and `finally()` methods. These methods return a new vow that reflects the result or error of the original vow. For example:

```js
vow.then(value => {
  // handle the resolved value here
}).catch(reason => {
  // handle the rejected reason here
}).finally(() => {
  // handle the final outcome here
});
```

You can also use the utility functions provided by the `Vow` class to work with arrays of promises. For example:

```js
const promises = [vow1, vow2, vow3];
Vow.all(promises).then(values => {
  // handle the resolved values here
}).catch(reason => {
  // handle the rejected reason here
});
```

For a full list of available methods and options, please refer to the `vow.js` file or the documentation.

## Contributing

Contributions are welcome! If you find a bug, have a feature request, or want to contribute to the codebase, please feel free to submit an issue or a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The native Promise object in JavaScript
- The open source community for their contributions and insights
```