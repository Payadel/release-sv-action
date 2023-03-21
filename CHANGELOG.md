# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.4](https://github.com/Payadel/release-sv-action/compare/v0.0.3...v0.0.4) (2023-03-21)


### Fixes

* fix pull request update bug ([5d5866d](https://github.com/Payadel/release-sv-action/commit/5d5866d111c643a87b3406a338f4e8e4b2fa0b19))

### [0.0.3](https://github.com/Payadel/release-sv-action/compare/v0.0.2...v0.0.3) (2023-03-21)

### Fixes

* **action:** add is_test_mode field to
  action.yml ([cb70cc6](https://github.com/Payadel/release-sv-action/commit/cb70cc69a8db408e19105ad1095beed013a45293))
* fix git push
  error. [#17](https://github.com/Payadel/release-sv-action/issues/17) ([64400b0](https://github.com/Payadel/release-sv-action/commit/64400b054842e56de51993a8678f2c9288212c29))
* fix pull request
  body ([e9aeddd](https://github.com/Payadel/release-sv-action/commit/e9aeddd6adeea5d22c89ef56c278e239904d3a5a))
* update PR when exist.
  fix [#19](https://github.com/Payadel/release-sv-action/issues/19) ([9229341](https://github.com/Payadel/release-sv-action/commit/9229341ee31dbbd14621a6fb21dd22172392cd6b))

### Development: CI/CD, Build, etc

* **release:** fix
  bugs ([657011e](https://github.com/Payadel/release-sv-action/commit/657011e9a8613a16a373b63b1488d087384ce9d7), [897feb3](https://github.com/Payadel/release-sv-action/commit/897feb33a69bd53051e33d9ec06f46dce32bd971))
* **release:** remove excess
  step `Create Pull Request` ([4149296](https://github.com/Payadel/release-sv-action/commit/41492962a02118104b84da1177e024de703b2d2c))
* **release:** set GITHUB_TOKEN to
  env ([a155cff](https://github.com/Payadel/release-sv-action/commit/a155cff1716df43589920dbceafd1e09304ae2d2))
* **release:** set is_test_mode to false in
  release.yaml ([e166069](https://github.com/Payadel/release-sv-action/commit/e1660690c8492885afe526612505956f94f9c14a))
* **release:** use local action for
  release ([6792be8](https://github.com/Payadel/release-sv-action/commit/6792be86f8ebb4b0fde29757b3da9506c9e78056))
* **release:** use Payadel/release-sv-action@v0.02 for
  release ([87b84bf](https://github.com/Payadel/release-sv-action/commit/87b84bf74b39f27fa257f778b820b6f1ea279783))

### [0.0.2](https://github.com/Payadel/release-sv-action/compare/v0.0.1...v0.0.2) (2023-03-21)

### Fixes

* fix `createReleaseFile`
  bug ([d4d6105](https://github.com/Payadel/release-sv-action/commit/d4d61050efbf0bddc23aa02b5475b1c10c3152c1))
* fix test mode
  bug ([5c39d8d](https://github.com/Payadel/release-sv-action/commit/5c39d8ddfb5abe931d4a39383f97c60f47e43569))

### Development: CI/CD, Build, etc

* add color to
  run-all-before-push.sh ([3a5a755](https://github.com/Payadel/release-sv-action/commit/3a5a755971cdab884f21be08485c7dc203d672a9))
* improve messages in
  run-all-before-push.sh ([89d34c1](https://github.com/Payadel/release-sv-action/commit/89d34c17c69798643d7c55e58a516d1964a4363f))
* update
  actions ([8657ad9](https://github.com/Payadel/release-sv-action/commit/8657ad9da64d6948114839aa5dab31f0aa97176d))
* update
  run-all-before-push.sh ([3618b6f](https://github.com/Payadel/release-sv-action/commit/3618b6f113c50ef3bb79b26bef58b73a8d67fdee))

### Tests

* fix build-test.yml and improve
  assert.sh ([157281b](https://github.com/Payadel/release-sv-action/commit/157281b1b74ea31b1b5510aa97687c2051fdc560))

### 0.0.1 (2023-03-20)

### Features

* add base
  codes ([6e2c9bf](https://github.com/Payadel/release-sv-action/commit/6e2c9bfb87feed68e63b7349bdd7434224f475de))
* add test
  mode ([fa2278f](https://github.com/Payadel/release-sv-action/commit/fa2278f6f252614c8fa4433e539c032acfd797c0))

### Development: CI/CD, Build, etc

* add
  pre-commit ([7024b9d](https://github.com/Payadel/release-sv-action/commit/7024b9db42576d58e4341f9998749163c7ec1790))
* add pre-commit
  shells ([9f4c9a4](https://github.com/Payadel/release-sv-action/commit/9f4c9a4c5fcb888fa76fe9dbedfb3e6d0ce08f37))
* **deps-dev:** bump
  @typescript-eslint/eslint-plugin ([a829a68](https://github.com/Payadel/release-sv-action/commit/a829a68cc843b8fd39db82ea7549a21744a9c5fe))
* **deps-dev:** bump eslint from 7.32.0 to
  8.36.0 ([82a6f72](https://github.com/Payadel/release-sv-action/commit/82a6f720c7db0255cb7e66675ee41c649bf0b9ea))
* **deps-dev:** bump prettier from 2.8.4 to
  2.8.5 ([b1da4ed](https://github.com/Payadel/release-sv-action/commit/b1da4ed2f2441ae2a2bef85f6b7329a2b76cb8e9))
* **deps:** bump actions/checkout from 2 to
  3 ([baa61f3](https://github.com/Payadel/release-sv-action/commit/baa61f33301cb7baaeaed6fd62f6dd67ce80ec15))
* **deps:** bump actions/setup-python from 3 to
  4 ([798ad0e](https://github.com/Payadel/release-sv-action/commit/798ad0e9aa159ac1ce32d3feb9febb84feaa208c))
* **deps:** bump actions/upload-artifact from 2 to
  3 ([3b3067e](https://github.com/Payadel/release-sv-action/commit/3b3067e14b552b6133920d2f4c13cbc4ee053bc7))
* **deps:** bump dessant/lock-threads from 2.0.3 to
  4.0.0 ([a52216f](https://github.com/Payadel/release-sv-action/commit/a52216f47a838adbd83b9fca756bf5768c0e6733))
* **deps:** bump github/codeql-action from 1 to
  2 ([9d5c150](https://github.com/Payadel/release-sv-action/commit/9d5c1504a89d07a657c1f50e3bbfad8c6a3cb484))
* **lock:** update lock.yml to new
  version ([5a32bcf](https://github.com/Payadel/release-sv-action/commit/5a32bcf28d8f0829d9dd5b03fd8ebc919d68c290))
