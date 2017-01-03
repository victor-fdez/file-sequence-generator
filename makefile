generator:
	@echo Installing dependencies...
	npm install

test:
	mocha test --reporter mocha-junit-reporter
	#mocha

.PHONY: generator, test
