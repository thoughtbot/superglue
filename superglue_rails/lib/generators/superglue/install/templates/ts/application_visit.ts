import {
  ApplicationRemote,
  ApplicationVisit,
  SuperglueStore,
  BuildVisitAndRemote,
} from "@thoughtbot/superglue";
import { visit, remote } from "@thoughtbot/superglue/action_creators";

/**
 * This function returns a wrapped visit and remote that will be used by UJS,
 * the Navigation component, and passed to your page components through the
 * NavigationContext.
 *
 * You can customize both functions to your liking. For example, for a progress
 * bar. This file also adds support for data-sg-remote.
 */
export const buildVisitAndRemote: BuildVisitAndRemote = (
  ref,
  store: SuperglueStore
) => {
  const appRemote: ApplicationRemote = (path, { dataset, ...options }) => {
    /**
     * You can make use of `dataset` to add custom UJS options.
     * If you are implementing a progress bar, you can selectively
     * hide it for some links. For example:
     *
     * ```
     * <a href="/posts?props_at=data.header" data-sg-remote data-sg-hide-progress>
     *   Click me
     * </a>
     * ```
     *
     * This would be available as `sgHideProgress` on the dataset
     */
    return store.dispatch(remote(path, options));
  };

  const appVisit: ApplicationVisit = (path, { dataset, ...options } = {}) => {
    /**
     * Do something before we make a request.
     * e.g, show a [progress bar](https://thoughtbot.github.io/superglue/recipes/progress-bar/).
     *
     * Hint: you can access the current pageKey
     * via `store.getState().superglue.currentPageKey`
     */
    return store
      .dispatch(visit(path, options))
      .then((meta) => {
        /**
         * The assets fingerprints changed, instead of transitioning
         * just go to the URL directly to retrieve new assets
         */
        if (meta.needsRefresh) {
          window.location.href = meta.pageKey;
          return meta;
        }

        /**
         * Your first expanded UJS option, `data-sg-replace`
         *
         * This option overrides the `navigationAction` to allow a link click or
         * a form submission to replace history instead of the usual push.
         */
        const navigatonAction = !!dataset?.sgReplace
          ? "replace"
          : meta.navigationAction;
        ref.current?.navigateTo(meta.pageKey, {
          action: navigatonAction,
        });

        /**
         * Return the meta object, it's used for scroll restoration when
         * handling the back button. You can skip returning, but Superglue
         * will warn you about scroll restoration.
         */
        return meta;
      })
      .finally(() => {
        /**
         * Do something after a request.
         *
         * This is where you hide a progress bar.
         */
      })
      .catch((err) => {
        const response = err.response;

        if (!response) {
          /**
           * This is for errors that are NOT from a HTTP request.
           *
           * Tooling like Sentry can capture console errors. If not, feel
           * free to customize to send the error to your telemetry tool of choice.
           */
          console.error(err);
          return;
        }

        if (response.ok) {
          /**
           * This is for errors that are from a HTTP request.
           *
           * If the response is OK, it must be an HTML body, we'll
           * go to that locaton directly.
           */
          window.location = response.url;
        } else {
          if (response.status >= 400 && response.status < 500) {
            window.location.href = "/400.html";
            return;
          }

          if (response.status >= 500) {
            window.location.href = "/500.html";
            return;
          }
        }
      });
  };

  return { visit: appVisit, remote: appRemote };
};
