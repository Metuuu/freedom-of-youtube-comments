# api/src

## Run function without AWS SAM (not recommended)
Navigate to this directory and run following command:
```
IS_DEVELOPMENT="true" API_METHOD="GET" API_PATH="/<ROUTE_NAME_HERE>" node -e 'require("./index").handler({ body: {} }).then(console.log)'
```
