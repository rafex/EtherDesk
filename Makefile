.PHONY: dev frontend-install frontend-dev frontend-start frontend-build frontend-preview backend-mock-install backend-mock-dev backend-mock-start backend-mock-build

FRONTEND_DIR := frontend
BACKEND_JS_DIR := backend/javascript

dev:
	@bash -lc 'trap "kill 0" INT TERM EXIT; $(MAKE) backend-mock-dev & $(MAKE) frontend-dev & wait'

frontend-install:
	$(MAKE) -C $(FRONTEND_DIR) install

frontend-dev:
	$(MAKE) -C $(FRONTEND_DIR) dev

frontend-start: frontend-dev

frontend-build:
	$(MAKE) -C $(FRONTEND_DIR) build

frontend-preview:
	$(MAKE) -C $(FRONTEND_DIR) preview

backend-mock-install:
	$(MAKE) -C $(BACKEND_JS_DIR) install

backend-mock-dev:
	$(MAKE) -C $(BACKEND_JS_DIR) dev

backend-mock-start:
	$(MAKE) -C $(BACKEND_JS_DIR) start

backend-mock-build:
	$(MAKE) -C $(BACKEND_JS_DIR) build
