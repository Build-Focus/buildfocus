curl https://cdn.rawgit.com/pimterry/git-confirm/v0.2.1/hook.sh > ./.git/hooks/pre-commit

git config --unset-all hooks.confirm.match

git config --add hooks.confirm.match "TODO"
git config --add hooks.confirm.match "FIXME"
git config --add hooks.confirm.match "describe.only"
git config --add hooks.confirm.match "it.only"
