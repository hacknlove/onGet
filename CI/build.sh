echo ------- Clean dist -------
rm -r ./dist

set -e

echo ------- Building dist -------
npx rollup -c

cp dist-package.json ./dist/package.json

git add ./dist/*

echo
echo
echo "************SUCCESS*****************"

echo "update version in package.json and do npm publish"
echo
echo
