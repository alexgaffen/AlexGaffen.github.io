import java.util.List;
import java.util.Map;

public class StubCatanAgent implements CatanAgent {
    
    private int playerId;

    @Override
    public void init(int playerId) {
        this.playerId = playerId;
    }

    @Override
    public Move chooseInitialSettlement(GameState state) {
        // Return a hardcoded valid starting settlement coordinate
        return new Move(MoveType.BUILD_SETTLEMENT, new Coordinate(0, 0)); 
    }

    @Override
    public Move chooseInitialRoad(GameState state) {
        // Return a hardcoded valid starting road
        return new Move(MoveType.BUILD_ROAD, new Edge(new Coordinate(0,0), new Coordinate(0,1)));
    }

    @Override
    public Move chooseMove(GameState state) {
        // Simply pass the turn to keep the game loop moving
        return new Move(MoveType.END_TURN);
    }

    @Override
    public Map<ResourceType, Integer> chooseDiscard(GameState state, int discardCount) {
        // Return a pre-configured map of resources to drop when a 7 is rolled
        return Map.of(ResourceType.SHEEP, discardCount); 
    }

    @Override
    public ResourceType chooseResource(GameState state) {
        // Hardcode a resource choice (e.g., for Year of Plenty)
        return ResourceType.ORE;
    }

    @Override
    public int chooseRobberTarget(GameState state, List<Integer> possibleTargets) {
        // Always pick the first available target
        if (possibleTargets != null && !possibleTargets.isEmpty()) {
            return possibleTargets.get(0);
        }
        return -1; // No target
    }

    @Override
    public DevelopmentCard chooseDevelopmentCard(GameState state) {
        // Always play a Knight card if asked
        return DevelopmentCard.KNIGHT;
    }
}