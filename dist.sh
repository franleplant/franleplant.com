cargo build --release
rm -rf dist/
mkdir dist
cp target/release/blog dist/blog
cp -r public dist/public
cp -r view dist/view
