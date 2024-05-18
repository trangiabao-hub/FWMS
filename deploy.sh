echo "Building app..."
npm run build
echo "Deploy files to server..."
scp -r -i /Users/macbook/Desktop/test dist/* root@159.223.65.4:/var/www/html/
echo "Done!"