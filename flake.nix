{
  description = "Development environment for the book review service backend";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    # nodejs_18-nixpkgs.url = "github:nixos/nixpkgs/080a4a27f206d07724b88da096e27ef63401a504";
    redis-nixpkgs.url = "github:nixos/nixpkgs/efd23a1c9ae8c574e2ca923c2b2dc336797f4cc4";
    nginx-nixpkgs.url = "github:nixos/nixpkgs/3281bec7174f679eabf584591e75979a258d8c40";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }@inputs:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        # nodejs_18-pkgs = import inputs.nodejs_18-nixpkgs {
        #   inherit system;
        # };
        redis-pkgs = import inputs.redis-nixpkgs {
          inherit system;
        };
        nginx-pkgs = import inputs.nginx-nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.postgresql_16
            # nodejs_18-pkgs.nodejs_18
            pkgs.nodejs_24
            redis-pkgs.redis
            nginx-pkgs.nginx
            pkgs.minikube
            pkgs.ngrok
          ];

          shellHook = ''
            echo "Entering Bookstore development environment..."
            echo "Node.js $(node -v)"
            echo "$(psql --version)"
            echo "$(redis-cli --version)"
            echo "$(nginx -v)"
            echo "$(minikube version)"
          '';
        };
        formatter = pkgs.nixfmt-tree;
      }
    );
}
