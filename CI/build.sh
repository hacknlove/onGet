echo ------- Clean dist -------
rm -r ./dist

set -e

echo ------- testing: unit -------
npx jest ./src

echo ------- Building dist -------
npx rollup -c

echo ------- testing: integration -------
npx jest ./CI/__tests__/

git add ./dist/*

echo
echo
echo "************SUCCESS*****************"

echo "update version in package.json and do npm publish"
echo
echo
