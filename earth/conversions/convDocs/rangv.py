import random
from sys import version_info

numGeos = 150
roots = 5
places = {}
out = open("random.dot", "w");


def main():
    print "generateing randomized dot file with coordinates"
    # open the file out

    out.write("digraph G {\n")
    out.write("	rankdir = LR;\n\tnode [ shape = rect];\n\t")

    # Create the logical loop to build the content of the file

    # start with a for loop generating random end points based on numGeos
    for i in range(0,numGeos):
        # generate a random coordinate and place it in places
        # lat = -90 - 90, lon = -180 - 180
        lat = random.uniform(-90,90)
        lon = random.uniform(-180,180)
        # convert the lat lon to string and store them into places
        slat = repr(lat)
        slon = repr(lon)
        loc = slat + ":" + slon
        places["lazy" + "%i"%(i)] = loc

    # the locations are now generated. Determine the number of roots
    # build a 2d array to seperate the keys into by their respective root assignments
    matrix = []

    currentMax = numGeos
    currentMin = 0

    taken = []
    keys = list(places.keys())
    # calculate points of seperation
    i = 0
    if(roots > 1):

        while i < roots:
            # calculate the current point to take from
            mid = (currentMax - currentMin)/2
            ranPoint = random.randrange(currentMin + 1, currentMax);

            if ranPoint < mid:
                matrix.append( fill(currentMin, ranPoint, keys))
                currentMin = ranPoint
            else:
                matrix.append(fill(ranPoint, currentMax, keys))
                currentMax = ranPoint



            i = i + 1

        if i == roots and currentMin < currentMax:
            latest = matrix[len(matrix) - 1]
            while currentMin < currentMax:
                latest.append(keys[currentMin])
                currentMin = currentMin + 1
    else:
        matrix.append(keys)


    baseChar = "a"
    for i in matrix:
        recursiveBuild(i, 0, baseChar)
        baseChar = chr(ord(baseChar) + 2)
    out.write("}")
    print "Completed"

# build the recursive function to calculate where everything needs to be
# going to recurse this tree from the bottom up. In other words we take
# the full array of leaf nodes and build their parents, whom we then pass
# recursively to this function to build their parents until only a single parent
# remain.
def recursiveBuild(children, name, character):
    currentName = name
    # determine given the size of the input array how many
    isodd = len(children) % 2
    # parent array being established and sent to next recursive itteration
    parents = []

    start = 0
    if isodd == 1:

        # need to determine if the name should should be in places
        child = children[0]
        if "lazy" in child:
            nextName = "%s%i"%(chr(ord(character) + 1),currentName)
            newChild = child.replace("lazy", chr(ord(character) + 1))

            currentName = currentName + 1
            outstring = "\"%s\"   -> \"%s\" [start=\"NONE\", end=\"%s\"]\n\t"%(nextName,newChild, places[child])
            out.write(outstring)
            ##
        else:
            nextName = "%s%i"%(character,currentName)
            currentName = currentName + 1
            outstring = "\"%s\"   -> \"%s\" [start=\"NONE\", end=\"NONE\"]\n\t" %(nextName,child)
            out.write(outstring)
        parents.append(nextName)
        start = 1

    while start < len(children):
        firstChild = children[start]
        secondChild = children[start + 1]
        nextName = "%s%i"%(character,currentName)
        if "lazy" in firstChild:
            #nextName = "%s%i"%(chr(ord(character) + 1),currentName)
            newChild = firstChild.replace("lazy", chr(ord(character) + 1))
            outstring = "\"%s\"   -> \"%s\" [start=\"NONE\", end=\"%s\"]\n\t"%(nextName,newChild, places[firstChild])
            out.write(outstring)
            #

        else:
            #nextName = "%s%i"%(character,currentName)
            outstring= "\"%s\"   -> \"%s\" [start=\"NONE\", end=\"NONE\"]\n\t"%(nextName,firstChild)
            out.write(outstring)

        if "lazy" in secondChild:
            #nextName = "%s%i"%(chr(ord(character) + 1),currentName)
            newChild = secondChild.replace("lazy", chr(ord(character) + 1))
            outstring = "\"%s\"   -> \"%s\" [start=\"NONE\", end=\"%s\"]\n\t"%(nextName,newChild, places[secondChild])
            out.write(outstring)
            ##

        else:
            #nextName = "%s%i"%(character,currentName)
            outstring = "\"%s\"   -> \"%s\" [start=\"NONE\", end=\"NONE\"]\n\t"%(nextName,secondChild)
            out.write(outstring)

        currentName = currentName + 1
        parents.append(nextName)
        start = start + 2
    if len(parents ) > 1:
        recursiveBuild(parents, currentName,character)



def fill(start, finish, oldarr):
    newarr = []
    begin = start
    while begin < finish:
         newarr.append( oldarr[begin])
         begin = begin + 1
    return newarr


if __name__ == "__main__":
        py3 = version_info[0] > 2 #creates boolean value for test that Python major version > 2
        if py3:
          numLoc = input("Please enter the number of Locations you would like generated: ")
          numRoots = input("Please enter the number of roots you would like to see for the above locations: ")
          numGeos = int(numLoc)
          roots = int(numRoots)
        else:
          numLoc = raw_input("Please enter the number of Locations you would like generated: ")
          numRoots = raw_input("Please enter the number of roots you would like to see for the above locations: ")
          numGeos = int(numLoc)
          roots = int(numRoots)
        main();
