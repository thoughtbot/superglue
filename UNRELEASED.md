# # Unreleased changes

## v0.14.0
- Add UJS attributes data-bz-remote and data-bz-visit
- Add copyPage action to allow optimistic updates
- Allow visit thunks to use urls with bzq by allowing a placeholder option
- Ensure all requests made by breezy gets a __=0 cache buster retained through redirect
- Remove formik and use Rails forms
- Add RailsTag component to use Rails innerhtml without a container tag
- Updated generators
- Add props_from_form_with to generate props for forms from Rails
- Add redirect_back_with_bzq to redirect back while retaining the bzq param
