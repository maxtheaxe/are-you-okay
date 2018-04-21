# Bruce A. Maxwell
# CS 151S
# Fall 2015
#
# Project 9
# Collision handler
#

import math

# utility math function for calculating Euclidean length of a 2D vector
def length(v):
    return math.sqrt(v[0]*v[0] + v[1]*v[1])

# utility math function for creating a unit 2D vector
def unit(v):
    l = math.sqrt(v[0]*v[0] + v[1]*v[1])
    if l > 0.0:
        return (v[0]/l, v[1]/l)
    return v


# Tests if there is a collision with the wall along the path of the
# ball.  Returns the distance to the collision or 1e+6 (a big number)
def collisionTest_ball_wall( ball, wall ):

    # get the ball's velocity and current position
    v = unit( ball.getVelocity() )
    ballP = ball.getPosition()

    # get the position of the floor
    wallP = wall.getPosition()

    # a variation on Liang-Barsky clipping
    p1 = -v[0]
    p2 = v[0]
    if ballP[0] < wallP[0]:
        # ball is to the left of the wall, so use the left boundary and ballx + radius
        q1 = (ballP[0]+ ball.getRadius()) - (wallP[0] - wall.getWidth()*0.5)
        q2 = (wallP[0] - wall.getWidth()*0.5) - (ballP[0] - ball.getRadius())
    else:
        # ball is on the right, so subtract radius and add wall width
        q1 = (ballP[0] - (ball.getRadius())) - (wallP[0] + wall.getWidth()*0.5)
        q2 = (wallP[0] + wall.getWidth()*0.5) - (ballP[0] - (ball.getRadius()))

    # running parallel to the wall, no collision for a stationary wall
    if p1 == 0.0: 
        return 1e+6

    if p1 < 0: # ball is heading in a +y direction
        if q1 > 0: # ball is headed away from the wall
            return 1e+6
        else: # ball is headed towards the wall
            return q1 / p1
    else: # ball is heading in a -y direction
        if q2 > 0: # ball is headed away from the wall
            return 1e+6
        else:
            return q2/p2
    

# Main collision function for handling ball/wall collisions
# Updates the ball's position and returns true if there was a collision.
# Returns False if there was no collision (ball still needs to be udpated).
def collision_ball_wall(ball, wall, dt):
    
    # returns the distance between the ball and the wall
    tk = collisionTest_ball_wall( ball, wall )
    
    d = length(ball.getVelocity())
    if d == 0.0: # special case if the ball is not moving at all
        return False

    # check if the collision will happen during dt
    delta = tk / (d*dt)
    if delta <= 1.0:

        # update to the collision
        ball.update( delta*dt )

        # change the velocity
        v = ball.getVelocity()
        be = ball.getElasticity()
        fe = wall.getElasticity()
        ball.setVelocity( [-v[0]*be*fe, v[1]] )

        # update after the collision
        ball.update(dt - delta*dt)
        
        return True

    # if no collision, calling function handles the update
    return False

# Tests if there is a collision with the floor along the path of the
# ball.  Returns the distance to the collision or 1e+6 (a big number)
def collisionTest_ball_floor( ball, floor ):

    # get the trajectory and position of the ball
    v = unit( ball.getVelocity() )
    ballP = ball.getPosition()

    # get the y position of the floor
    floorP = floor.getPosition()

    # a variation on Liang-Barsky clipping
    p3 = -v[1]
    p4 = v[1]
    if ballP[1] > floorP[1]:
        q3 = (ballP[1]-ball.getRadius()) - (floorP[1] + floor.getHeight()*0.5)
        q4 = (floorP[1] + floor.getHeight()*0.5) - (ballP[1] - ball.getRadius())
    else:
        q3 = (ballP[1] + ball.getRadius()) - (floorP[1] - floor.getHeight()*0.5)
        q4 = (floorP[1] - floor.getHeight()*0.5) - (ballP[1] - ball.getRadius())

    if p4 == 0.0: # parallel traejectory to the wall
        return 1e+6

    if p3 < 0: # ball is heading in a +y direction
        if q3 > 0: # ball is headed away from the wall
            return 1e+6
        else: # ball is headed towards the wall
            return q3 / p3
    else: # ball is heading in a -y direction
        if q4 > 0: # ball is headed away from the wall
            return 1e+6
        else:
            return q4/p4
        
# Main collision function for handling ball/floor collisions
# Updates the ball's position and returns true if there was a collision.
# Returns False if there was no collision (ball still needs to be udpated).
def collision_ball_floor(ball, floor, dt):
    
    # returns the distance between the ball and the floor
    tk = collisionTest_ball_floor( ball, floor )
    
    d = length(ball.getVelocity())
    if d == 0.0:
        return False

    # check if the collision will happen during dt
    delta = tk / (d*dt)
    if delta <= 1.0:

        # update to the collision
        ball.update( delta*dt )

        # update the velocity
        v = ball.getVelocity()
        be = ball.getElasticity()
        fe = floor.getElasticity()
        ball.setVelocity( [v[0], -v[1] * be * fe] )

        # update after the collision
        ball.update(dt - delta*dt)
        
        return True

    # if no collision, calling function is responsible for the update
    return False

# Tests if there is a collision with another ball along the path of
# the ball.  Returns the distance to the collision or 1e+6 (a big
# number)
def collisionTest_ball_ball(ball1, ball2):

    # Concept: hold ball2 still and test if it is too close to the trajectory of ball1.

    # get the unit velocity vectors and positions
    v1 = unit( ball1.getVelocity() )
    v2 = unit( ball2.getVelocity() )

    p1 = ball1.getPosition()
    p2 = ball2.getPosition()

    r1 = ball1.getRadius()
    r2 = ball2.getRadius()

    # throw a line out from ball1 and find the closest approach to
    # ball 2
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]

    cth = dx * v1[0] + dy * v1[1] # dot product of vector connecting two circles and the unit velocity vector
    if cth <= 0.0: # ball1 is heading away from the ball2
        return 1e+6

    pclose = ( p1[0] + v1[0]*cth, p1[1] + v1[1]*cth )
    pvec = ( pclose[0] - p2[0], pclose[1] - p2[1] )
    dist = length( pvec )

    if dist > r1 + r2: # not hitting ball2 on this step
        return 1e+6

    # hitting this step
    t = math.sqrt( dist*dist + (r1 + r2)*(r1 + r2) ) # distance traveled from pclosedist
    pclosedist = length( (v1[0]*cth, v1[1]*cth) )
    
    distToImpact = pclosedist - t

    # return how much distance to impact
    return distToImpact
    

# Main collision function for handling ball/ball collisions
# Updates the ball1's position and returns true if there was a collision.
# Returns False if there was no collision (ball1 still needs to be udpated).
# ball2's velocity is changed, but it is not updated by this function
def collision_ball_ball(ball1, ball2, dt):

    # holds ball2 steady, tests ball1's trajectory
    distToImpact = collisionTest_ball_ball(ball1, ball2)

    # get the magnitude of the velocity of ball1
    v1 = ball1.getVelocity()
    v2 = ball2.getVelocity()
    vmag1 = length( ball1.getVelocity() )

    # no collision if it's too far away
    if distToImpact > vmag1 * dt:
        return False

    delta = distToImpact / (vmag1*dt)

    # don't update backwards, which can happen, strangely enough
    if delta > 0.0:
        ball1.update( delta*dt )

    p1 = ball1.getPosition()
    p2 = ball2.getPosition()
    rvec = unit( (p1[0] - p2[0], p1[1] - p2[1]) ) # reflection vector

    # create the reflection matrix R(th)M(X)R(-th)

    # update ball1's velocity
    # rotate reflection vector to the Y axis
    tvx =  rvec[0] * v1[0] + rvec[1] * v1[1]
    tvy = -rvec[1] * v1[0] + rvec[0] * v1[1]

    # mirror in X
    tvx = - tvx*ball1.getElasticity()*ball2.getElasticity() # need to add the loss factor here

    # rotate back
    vfx = rvec[0] * tvx - rvec[1] * tvy
    vfy = rvec[1] * tvx + rvec[0] * tvy

    ball1.setVelocity( [vfx, vfy] )

    # update ball2's velocity
    tvx =  rvec[0] * v2[0] + rvec[1] * v2[1]
    tvy = -rvec[1] * v2[0] + rvec[0] * v2[1]

    # mirror in X
    tvx = - tvx*ball1.getElasticity()*ball2.getElasticity() # need to add the loss factor here

    # rotate back
    vfx = rvec[0] * tvx - rvec[1] * tvy
    vfy = rvec[1] * tvx + rvec[0] * tvy

    ball2.setVelocity( [vfx, vfy] )

    # finish updating ball1
    if delta > 0.0:
        ball1.update( dt - delta*dt )
    else:
        ball1.update( dt )

    return True


# Test if a ball is colliding with any side of a block, and indicate
# which side. Sends out a line along the ball's velocity vector and
# compares it with all four sides of the object.
def collisionTest_ball_block(ball, block):
    # get the trajectory and position of the ball
    v = unit( ball.getVelocity() )
    ballP = ball.getPosition()
    radius = ball.getRadius()

    # get the position of the block
    blockP = block.getPosition()

    # a variation on Liang-Barsky clipping
    # expands the block by the size of the ball before testing
    p = ( -v[0], v[0], -v[1], v[1] )
    q = (ballP[0] - (blockP[0] - block.getWidth()*0.5 - radius),
         (blockP[0] + block.getWidth()*0.5 + radius) - ballP[0],
         ballP[1] - (blockP[1] - block.getHeight()*0.5 - radius),
         (blockP[1] + block.getHeight()*0.5 + radius) - ballP[1] )

    # for all four cases
    tmin = -1e+6
    tmax = 1e+6
    side = -1
    for i in range(4):
        if p[i] == 0.0: # no collision for this side of the block, motion is parallel to it
            if q[i] < 0: # outside the boundary of the box, no collision
                return 1e+6,0
            continue

        tk = q[i] / p[i]

        if p[i] < 0: # outside moving in
            if tk > tmin:
                tmin = tk
                side = i
        else:
            tmax = min( tmax, tk )

        if tmax <= tmin: # no intersection with the box
            return 1e+6,0

    if tmin < 0:
        tmin = 1e+6

    # tmin is the closest intersection on side i
    # 0: coming up from below
    # 1: coming down from above
    # 2: coming from the left
    # 3: coming from the right
    return (tmin, side)

# Main collision code for ball/block interactions.
# Updates the ball's position and returns true if there was a collision.
# Returns False if there was no collision (balla still needs to be udpated).
def collision_ball_block(ball, block, dt):
    
    # get distance to impact
    distToImpact, side = collisionTest_ball_block( ball, block )

    # check if the impact is farther away than one step
    vmag = length( ball.getVelocity() )
    if vmag == 0.0 or distToImpact > vmag * dt:
        return False

    # update the ball prior to the collision
    delta = distToImpact / (vmag * dt)
    ball.update( delta * dt )

    # modify the velocities
    v = ball.getVelocity()
    if side == 0 or side == 1: # left or right wall, so adjust x
        ball.setVelocity( [-v[0]*ball.getElasticity()*block.getElasticity(), v[1] ] )
    elif side == 2 or side == 3: # top or bottom wall, so adjust y
        ball.setVelocity( [v[0], -v[1]*ball.getElasticity()*block.getElasticity() ] )

    # update the ball post-collision
    ball.update( (1 - delta) * dt )
    
    return True

########CODE I WROTE:#########
###### collision_router and helper functions go here  ################
collision_router = {}
collision_router[ ('ball', 'ball') ] = collision_ball_ball
collision_router[ ('ball', 'floor') ] = collision_ball_floor
collision_router[ ('ball', 'wall') ] = collision_ball_wall
collision_router[ ('ball', 'block') ] = collision_ball_block
collision_router[ ('ball', 'shape') ] = collision_ball_block

def collision(thing1, thing2, dt):
	key = (thing1.getType(), thing2.getType())
	return collision_router[key](thing1, thing2, dt)

'''def collision(thing_1, thing_2, t2, step):
	i = [thing_1, thing_2]
	if i[1] == 'ball':
		
		collision_ball_ball(thing_1, t2, step)
	elif i[1] == 'floor':
		
		collision_ball_floor(thing_1, t2, step)
	elif i[1] == 'wall':
		
		collision_ball_wall(thing_1, t2, step)
	elif i[1] == 'block':
		collision_ball_block(thing_1, t2, step)
	
	elif i[1] == 'shape':
		collision_ball_block(thing_1, t2, step)'''
			
			
