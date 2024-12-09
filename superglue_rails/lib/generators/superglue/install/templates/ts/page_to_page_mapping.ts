import PostsNew from "../views/posts/new";
import PostsShow from "../views/posts/show";
import PostsEdit from "../views/posts/edit";
import PostsIndex from "../views/posts/index";

// import your page component #todo fix output of new lines
// e.g import PostsEdit from '../views/posts/edit'

// Mapping between your props template to Component, you must add to this
// to register any new page level component you create. If you are using the
// scaffold, it will auto append the identifers for you.
//
// e.g {'posts/new': PostNew}
export const pageIdentifierToPageComponent = {
  "posts/new": PostsNew,
  "posts/show": PostsShow,
  "posts/edit": PostsEdit,
  "posts/index": PostsIndex,
};
