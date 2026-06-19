.DEFAULT_GOAL := zip

.PHONY: zip

zip:
	@zip -r extension.zip . \
		-x "extension.zip" \
		-x "*.DS_Store" \
		-x "__MACOSX/*" \
		-x "*/.DS_Store" \
		-x "._*" \
		-x ".git/*" \
		-x ".claude/*" \
		-x "Makefile"
