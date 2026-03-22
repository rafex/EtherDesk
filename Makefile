.PHONY: frontend-install frontend-dev frontend-start frontend-build frontend-preview backend-install backend-dev backend-start backend-build

FRONTEND_DIR := frontend
BACKEND_JS_DIR := backend/javascript

frontend-install:
	$(MAKE) -C $(FRONTEND_DIR) install

frontend-dev:
	$(MAKE) -C $(FRONTEND_DIR) dev

frontend-start: frontend-dev

frontend-build:
	$(MAKE) -C $(FRONTEND_DIR) build

frontend-preview:
	$(MAKE) -C $(FRONTEND_DIR) preview

backend-install:
	$(MAKE) -C $(BACKEND_JS_DIR) install

backend-dev:
	$(MAKE) -C $(BACKEND_JS_DIR) dev

backend-start:
	$(MAKE) -C $(BACKEND_JS_DIR) start

backend-build:
	$(MAKE) -C $(BACKEND_JS_DIR) build
