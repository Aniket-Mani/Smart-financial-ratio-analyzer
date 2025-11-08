def pretty_float(x):
    try:
        return round(float(x), 4)
    except:
        return x
