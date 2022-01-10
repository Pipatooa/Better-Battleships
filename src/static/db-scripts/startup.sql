/* Remove all games which did not complete - i.e interrupted by server shutdown */
DELETE FROM game WHERE completion IS NULL;
