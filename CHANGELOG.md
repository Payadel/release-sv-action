# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/Payadel/release-sv-action/compare/v0.2.2...v0.3.0) (2023-05-01)


### ⚠ BREAKING CHANGES

* rename `releaseFileName` output to `release-filename`

### Features

* add `pull-request-url` as output ([26e507e](https://github.com/Payadel/release-sv-action/commit/26e507eda1cacd1bc3cee0db774e6f04326f778d))
* add more validation ([888f51a](https://github.com/Payadel/release-sv-action/commit/888f51a3b4a64c0f444b4fc0bde702885b42eff8))
* add validation for branch name ([fe5e4ed](https://github.com/Payadel/release-sv-action/commit/fe5e4ed72d043fe9ff252ed3f7bf8916d1d958e9))
* automatic detection option to generate changelog file ([850449a](https://github.com/Payadel/release-sv-action/commit/850449a57c0ed7a0692cd4b2edabb4f195b26aee))
* more validations and configs for version ([ba401a0](https://github.com/Payadel/release-sv-action/commit/ba401a079cfb81ae1d8ca83d1f34df5a8796b428))
* only adds new changelog text to PR and also set to output ([e259b93](https://github.com/Payadel/release-sv-action/commit/e259b931d22ac1668f5fb6a0ca0b79c0c9c7c1ba))
* validate version pattern ([8f69c21](https://github.com/Payadel/release-sv-action/commit/8f69c2114acf1af683e955d3c378dae9e10d3384))


### Fixes

* fix `changelog-version-regex` ([ba66ba9](https://github.com/Payadel/release-sv-action/commit/ba66ba953fe9f333271c08bb9e438b5457b67907))
* fix `getBooleanInputOrDefault` & refactor & add tests ([d1c1ec5](https://github.com/Payadel/release-sv-action/commit/d1c1ec57aa97d5c6d6aef49d6f5e85a8eeff84cd))
* fix `readVersionFromNpm` ([a99b097](https://github.com/Payadel/release-sv-action/commit/a99b09778766c33e51b7f4328a3ca4ae30653876))
* fix branch name validation ([57bf3eb](https://github.com/Payadel/release-sv-action/commit/57bf3eb57ba1581ad32f9b788bf213d637c4432a))
* fix default `changelog-version-regex` in `action.yml` ([66914d9](https://github.com/Payadel/release-sv-action/commit/66914d9f6cbe39560744fa9621b6f82873a5a872))
* fix get inputs ([f06848e](https://github.com/Payadel/release-sv-action/commit/f06848ef42fe92557a885ef5c8992e6838a0c0b3))
* fix main runner ([3a25d4d](https://github.com/Payadel/release-sv-action/commit/3a25d4dcd271c2a8bab2af28e6721e76833425a7))
* fix minor bugs ([a861906](https://github.com/Payadel/release-sv-action/commit/a861906fdb5ce2ae499515892ffba3461a632ffa))
* improve `detectNewVersion`, add tests, etc ([1c8d6c1](https://github.com/Payadel/release-sv-action/commit/1c8d6c1245c1edc476c10ee1276f679eec23f7dd))
* improve `execBashCommand` ([94c226b](https://github.com/Payadel/release-sv-action/commit/94c226b663811038e30a2ba551e76c2300a88a54))
* improve `pull request` section, bash command and errors ([8722a5e](https://github.com/Payadel/release-sv-action/commit/8722a5ee33b514c86ad689d146af66b4cd0e521b))
* improve action.yml ([0320d63](https://github.com/Payadel/release-sv-action/commit/0320d63acdecb865b9f35fdf50707bea6029195e))
* improve changelog: classify, bug fix, etx ([963181a](https://github.com/Payadel/release-sv-action/commit/963181ab71de959c8fb352b2a3aca5c05d30ad67))
* improve pull request commands ([6b6b5c1](https://github.com/Payadel/release-sv-action/commit/6b6b5c111614913a2851a1fce705d97d596483dc))
* minor updates ([b76dcdc](https://github.com/Payadel/release-sv-action/commit/b76dcdcc3af80e5ff012fa72aad974a221872ad1))
* remove `exportInputsInTestMode` ([1957f52](https://github.com/Payadel/release-sv-action/commit/1957f52fc50e5683e421d7ac13292a37b027bb74))
* rename `releaseFileName` output to `release-filename` ([dad6304](https://github.com/Payadel/release-sv-action/commit/dad6304420abbc0373cb0c60e1f626491d117bdc))
* set `releaseFileName` to output ([8b98828](https://github.com/Payadel/release-sv-action/commit/8b98828bd5641bfcf2f2be657672f07a95366919))
* set new version to output ([dc06339](https://github.com/Payadel/release-sv-action/commit/dc0633920eab1354471072a6e659482bd4965edc))


### Refactors

* add `configs.ts` and `DEFAULT_INPUTS` in it ([4427742](https://github.com/Payadel/release-sv-action/commit/4427742c9543c3bdd01e08ddd20063c4c0732633))
* classify functions ([67388b6](https://github.com/Payadel/release-sv-action/commit/67388b62af81357fea5956fb030ddabb0a424335))
* improve outputs ([ddd2b22](https://github.com/Payadel/release-sv-action/commit/ddd2b225ab97b75768b1a952ea12f4abdec5f177))
* move get input functions to utility.ts ([a909df3](https://github.com/Payadel/release-sv-action/commit/a909df38c4e32d235578665e47445549eacb4fb5))
* refactor inputs ([8c03529](https://github.com/Payadel/release-sv-action/commit/8c03529c150ef8eabf838547cbdbe9a7b74667b3))
* refactor to new style of payadel template ([a200b41](https://github.com/Payadel/release-sv-action/commit/a200b41b5c56e134ecae0fb3e64bfc808e046459))
* reorder action.yml ([3107292](https://github.com/Payadel/release-sv-action/commit/31072926b9546d4a082dc4940cc012de5caef7df))
* reorder DEFAULT_INPUTS ([939da79](https://github.com/Payadel/release-sv-action/commit/939da79b63a6b91a840f8e3c75c539f204564bf5))


### Tests

* add and fix tests to utility.ts ([8940722](https://github.com/Payadel/release-sv-action/commit/89407221b629e3dc14740e1819232842d50ebaa7))
* add and update inputs.test.ts ([b9c1e02](https://github.com/Payadel/release-sv-action/commit/b9c1e02f00ca878ee5da37cc3003b3924e612b06))
* add tests for `standard-version` ([f45bb28](https://github.com/Payadel/release-sv-action/commit/f45bb286a2602c4974b7ebdf60df50abd409538e))
* add tests for `versionMustValid` ([77173a7](https://github.com/Payadel/release-sv-action/commit/77173a7dde44dc429009afcdbf1b0e12d5070aa2))
* add tests for inputs.ts ([0985809](https://github.com/Payadel/release-sv-action/commit/0985809beef858d044e3de5048a097712cdb690c))
* add tests for utility.ts ([0843c23](https://github.com/Payadel/release-sv-action/commit/0843c23dd5fcd21843d5a7b1c407d8f09ab5ec8c))
* fix `collectCoverageFrom` in jest.config.js ([83b86af](https://github.com/Payadel/release-sv-action/commit/83b86afc8874bca5464b60a66b70d0ea1c59cfd1))
* fix mock tests ([27b3187](https://github.com/Payadel/release-sv-action/commit/27b3187aea616eea420a206179a724f3a1d89eb7))
* move `push` tests to git.test.ts ([0040d4d](https://github.com/Payadel/release-sv-action/commit/0040d4d49c2b9245d5eb4872a00440d49a758041))
* update jest.config.js ([7b2a54c](https://github.com/Payadel/release-sv-action/commit/7b2a54c2158fca2962a3fb31f79a37bb4c313a80))


### Development: CI/CD, Build, etc

* add **/*.utility.ts as utility files ([24a60b2](https://github.com/Payadel/release-sv-action/commit/24a60b27b62a95866638db3d798a25154e7f74d1))
* fix build-test.yml ([cbd17c8](https://github.com/Payadel/release-sv-action/commit/cbd17c863bfce057ac3bf424794fc73d74f48b27))
* fix build-test.yml ([ab89e21](https://github.com/Payadel/release-sv-action/commit/ab89e21537dfc514e26f8cb6ed94b77b0ff84c17))
* fix check-dist.yml event ([573347b](https://github.com/Payadel/release-sv-action/commit/573347b3746be19565a783eec90713d97909cd4a))
* remove excess github actions ([ca6c01e](https://github.com/Payadel/release-sv-action/commit/ca6c01e931374f68891133df5e61462517f37d48))
* update actions ([a8c252a](https://github.com/Payadel/release-sv-action/commit/a8c252ac47027a5f45517f6da64e4004809a5e6e))
* update package.json and tsconfig.json ([36c7a6e](https://github.com/Payadel/release-sv-action/commit/36c7a6ea0e025056a10e5b4ae11b342dde247b4f))

### [0.2.1](https://github.com/Payadel/release-sv-action/compare/v0.2.0...v0.2.1) (2023-03-22)


### Features

* **releaseFileName:** add `releaseFileName` as output ([4a20ac7](https://github.com/Payadel/release-sv-action/commit/4a20ac7f79ac85ddb9cea5a69b8c1868e1755ed0))


### Development: CI/CD, Build, etc

* fix build-test.yml ([45f6b8c](https://github.com/Payadel/release-sv-action/commit/45f6b8ca16528ca154a14a432080a0501dbf70c0))

## [0.2.0](https://github.com/Payadel/release-sv-action/compare/v0.1.0...v0.2.0) (2023-03-22)


### ⚠ BREAKING CHANGES

* rename input names

### Fixes

* rename input names ([5506eed](https://github.com/Payadel/release-sv-action/commit/5506eed6070c925dd0c901b693bba1bb3df98d83))
* run `push` function in the last steps to reduce the possibility of error ([7f11d5e](https://github.com/Payadel/release-sv-action/commit/7f11d5e617f72f6998fb276117a292d43f6b7688))

### Refactors

* manage inputs in inputs.ts ([76922c5](https://github.com/Payadel/release-sv-action/commit/76922c5d6050442fe90bfe3fa787eb406e135166))


### Development: CI/CD, Build, etc

* add `skip_release_file` option to GitHub actions ([e173e66](https://github.com/Payadel/release-sv-action/commit/e173e661962488d3a21445ab1014eaf7339e27b1))
* **release:** add `skip_release_file` option to release.yaml ([ade4d52](https://github.com/Payadel/release-sv-action/commit/ade4d528c3175207e4ad1d1a7de5cba460649e80))
* update eslint rules ([29003cc](https://github.com/Payadel/release-sv-action/commit/29003ccb689d70c5817982c5145aae392ec15f11))


## [0.1.0](https://github.com/Payadel/release-sv-action/compare/v0.0.4...v0.1.0) (2023-03-22)

### ⚠ BREAKING CHANGES

* add `skip_release_file` option for skip create release file. Default is true

### Features

* add `skip_release_file`
  option ([738ec0f](https://github.com/Payadel/release-sv-action/commit/738ec0f38a55819935a5dd74f6e4aca5fe8662cf))

### [0.0.4](https://github.com/Payadel/release-sv-action/compare/v0.0.3...v0.0.4) (2023-03-21)

### Fixes

* fix pull request update
  bug ([5d5866d](https://github.com/Payadel/release-sv-action/commit/5d5866d111c643a87b3406a338f4e8e4b2fa0b19))

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
