from src.database import AkitaBusWayFinder

print("initializing")
wf = AkitaBusWayFinder("./data/")
print("done")
print(wf.get_trip_journey("平日_07時00分_系統40002", "4043_01"))
