generator:
	@echo Installing dependencies...
	npm install

test:
	mocha

.PHONY: generator, test
