# elastos-light-wallet

### to check if your node is working run:

url http://localhost:21333 -d '{"method":"getnodestate"}' -H "Content-Type: application/json"

### if the usb device cannot be detected, try adding the udev rules:
https://support.ledger.com/hc/en-us/articles/115005165269-Connection-issues-with-Windows-or-Linux

```
wget -q -O - https://raw.githubusercontent.com/LedgerHQ/udev-rules/master/add_udev_rules.sh | sudo bash
```


### requirements

```
nodejs v10.11.0 or higher.
npm 6.4.1 or higher.
python 2.7 (for multiple versions, run "npm config set python ${path-to-python2.7}")
```

if windows give you an error "cannot find vcbuild.exe"

```
npm install -g --production windows-build-tools
```

if mac gives you error 'Library not loaded: libintl.8.dylib' when creating the packaged exeutables try:

```
sudo port install gettext;

ln -s /opt/local/lib/libintl.8.dylib /usr/local/opt/gettext/lib/libintl.8.dylib;
```

To build a release:
```
npm run dist-mac;
npm run dist-win;
npm run dist-linux;
```


## Checksum:
  v1.0.4

  windows:

  openssl dgst -sha512 -binary Elastos-Light-Wallet-Setup-1.0.4.exe | openssl base64 -A

  xxxx

  Ubuntu 18:

  openssl sha -sha512 Elastos-Light-Wallet-1.0.4.AppImage

  xxxx

  Mac:

  openssl dgst -sha512 Elastos-Light-Wallet-1.0.4.dmg

  xxxx


### helpful hash tools:
Hash of a hex message:
echo -n "<hex>" | shasum -a 512

Hash of the binary code inside a hex message:
perl -e 'print pack("H*","<hex>")' | shasum -a 512

### helpful to find stray packages

npm ls node-gyp


# to auto build a releases
  git commit -am v1.0.4;
  git tag v1.0.4;
  git push;
  git push --tags;

## to delete release tags
  git push --delete origin v1.0.4;
  git tag -d v1.0.4;
  git pull;
  git push;
