# bz2

# focus on nav - add test for it - ok
# remove history from other places and just leave it to nav - ok
# also remove other dispatch events - ok
# test mapstatetoprops and mapdispatchtoprops - ok
# rename bz_remote - ok
# add deferement support - ok
# revamp dom listeners to use new nav - ok
# fix start api - ok
# add reminaing tests, defer -ok
# finish queues - ok
# queues to flow - ok
# install lint - ok
# build process - ok
# push state?? - ok for now...
# catch 204s and rethrow? -ok...
# rename sync to visit - ok
# rename name to view?? - ok
# need baseURL for parse pathname - ok
# remove transition cache - ok
# redirects - ok
# figure out how mapstate to props does shouldupdatecomponenet. do i need a custom thingy?? no this is fine... 
# enable cookies - supported out of the box without credentials according to https://stackoverflow.com/questions/41132167/react-native-fetch-cookie-persist
# pass the entire page... no only data
# uncomment form submit support - ok
# do json payloads work?? yes, its just fetch just make sure to use json.stringify
# dispatch better lifecycle params- meh its fine..
# map state to props, bump version # dont support react navigation

# mark a route as home*, initial state...basically the front end app can determine which view to use based on data type or what business data the app sends over. But it knows nothing on the first load.
1. put it in the render with overrides. This already exists. Just rename view to container

# invert control flow and the remote actioncreator - revamp remote to take in a url as fir params?
# refactor and add tests for BREEZY_HISTORY_CHANGE
# and pathname??? referrer/????
# generators for redux mobile?
# how about router for webapp?? the nav is a bit.. easy..
# add some dispatches to the null render?
# reflect on rails generators

