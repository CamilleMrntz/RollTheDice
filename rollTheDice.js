// import random

/* # ----------------------< Game rules constants  >-----------------------------------------------------------------------
# Rules can be parametrized by this globals constants
#
# Standard Farkle rules :
#  5 dices with 6 faces
#  1 & 5 are scoring
#  1 is scoring 100 pts
#  5 is scoring 50 pts
#
#  Bonus for 3 dices with the same value
#   3 ace is scoring 1000 pts
#   3 time the same dice value is scoring 100 pts x the dice value
*/

const NB_DICE_SIDE = 6 // # Nb of side of the Dices;
const SCORING_DICE_VALUE = [1, 5] // # list_value of the side values of the dice who trigger a standard score;
const SCORING_MULTIPLIER = [100, 50] // # list_value of multiplier for standard score;

const THRESHOLD_BONUS = 3 // # Threshold of the triggering for bonus in term of occurrence of the same slide value;
const STD_BONUS_MULTIPLIER = 100 // # Standard multiplier for bonus;
const ACE_BONUS_MULTIPLIER = 1000 // # Special multiplier for aces bonus;

const DEFAULT_DICES_NB = 5 // # Number of dices by default in the set;


function roll_dice_set(nb_dice_to_roll) {
    /* """ Generate the occurrence list of dice value for nb_dice_to_roll throw

        :parameters     nb_dice_to_roll         the number of dice to throw

        :return:        occurrence list of dice value
    """
    */

    let dice_value_occurrence = [0] * NB_DICE_SIDE
    let dice_index = 0

    while (dice_index < nb_dice_to_roll) {
        // dice_value = random.randint(1, NB_DICE_SIDE)
        let dice_value = Math.floor(Math.random() * (NB_DICE_SIDE - 1 + 1)) + 1
        dice_value_occurrence[dice_value - 1] += 1
        dice_index += 1
    }

    return dice_value_occurrence
}


function analyse_bonus_score(dice_value_occurrence) {
    /* """ Compute the score for bonus rules and update occurrence list

        :parameters     dice_value_occurrence       occurrence list of dice value

        :return:        a dictionary with
                        - 'score'                   the score from bonus rules
                        - 'scoring_dice'            occurrence list of scoring dice value
                        - 'non_scoring_dice'        occurrence list of non scoring dice value
    """
    */ 

    let scoring_dice_value_occurrence = [0] * NB_DICE_SIDE

    let bonus_score = 0
    let side_value_index = 0
    let bonus_multiplier = 1
    while (side_value_index < dice_value_occurrence.length) {
        let side_value_occurrence = dice_value_occurrence[side_value_index]
    
        let nb_of_bonus = side_value_occurrence // THRESHOLD_BONUS
        if (nb_of_bonus > 0) {
            if (side_value_index == 0) {
                bonus_multiplier = ACE_BONUS_MULTIPLIER
            } else {
                bonus_multiplier = STD_BONUS_MULTIPLIER
            }
            bonus_score += nb_of_bonus * bonus_multiplier * (side_value_index + 1)
    
            // # update the occurrence list after bonus rules for scoring dices and non scoring dices
            dice_value_occurrence[side_value_index] %= THRESHOLD_BONUS
            scoring_dice_value_occurrence[side_value_index] = nb_of_bonus * THRESHOLD_BONUS
        }
    
        side_value_index += 1
    }

    let score = bonus_score
    let scoring_dice = scoring_dice_value_occurrence
    let non_scoring_dice = dice_value_occurrence

    return { score,
             scoring_dice,
             non_scoring_dice
    }
}


function analyse_standard_score(dice_value_occurrence) {
    /* """ Compute the score for standard rules and update occurrence list

        :warning :      occurrence list of dice value should be cleaned from potential bonus
                        call analyse_bonus_score() first

        :parameters     dice_value_occurrence       occurrence list of dice value

        :return:        a dictionary with
                        - 'score'                   the score from standard rules
                        - 'scoring_dice'            occurrence list of scoring dice value
                        - 'non_scoring_dice'        occurrence list of non scoring dice value
    """
    */

    let scoring_dice_value_occurrence = [0] * NB_DICE_SIDE
    let scoring_multiplier = []

    let standard_score = 0
    let scoring_dice_value_index = 0
    while (scoring_dice_value_index < SCORING_DICE_VALUE.length) {
        scoring_value = SCORING_DICE_VALUE[scoring_dice_value_index]
        scoring_multiplier = SCORING_MULTIPLIER[scoring_dice_value_index]

        standard_score += dice_value_occurrence[scoring_value - 1] * scoring_multiplier

       // # update the occurrence list after standard rules for scoring dices and non scoring dices
        scoring_dice_value_occurrence[scoring_value - 1] = dice_value_occurrence[scoring_value - 1]
        dice_value_occurrence[scoring_value - 1] = 0

        scoring_dice_value_index += 1
    }

    let score = standard_score
    let scoring_dice = scoring_dice_value_occurrence
    let non_scoring_dice = dice_value_occurrence

    return { score,
             scoring_dice,
             non_scoring_dice
    }

}


function analyse_score(dice_value_occurrence) {
    /* """ Compute the score for standard and bonus rules, update occurrence list

        :parameters     dice_value_occurrence       occurrence list of dice value

        :return:        a dictionary with
                        - 'score'                   the score from standard rules
                        - 'scoring_dice'            occurrence list of scoring dice value
                        - 'non_scoring_dice'        occurrence list of non scoring dice value
    """
    */

    let analyse_score_bonus = analyse_bonus_score(dice_value_occurrence)
    console.log("analyse bonus score function executed")
    let score_bonus = analyse_score_bonus.score
    let scoring_dice_from_bonus = analyse_score_bonus.scoring_dice
    let non_scoring_dice_from_bonus = analyse_score_bonus.non_scoring_dice

    let analyse_score_std = analyse_standard_score(non_scoring_dice_from_bonus)
    console.log("analyse standard score function executed")
    let score_std = analyse_score_std.score
    let scoring_dice_from_std = analyse_score_std.scoring_dice
    let non_scoring_dice_from_std = analyse_score_std.non_scoring_dice

    // # the occurrence list of scoring dice value is the sum from scoring dice by bonus and standard rules
    let scoring_dice_value_occurrence = [0] * NB_DICE_SIDE
    let side_value_index = 0
    while (side_value_index < NB_DICE_SIDE) {
        scoring_dice_value_occurrence[side_value_index] = scoring_dice_from_bonus[side_value_index] + scoring_dice_from_std[side_value_index]
        side_value_index += 1
    }

    let score = score_std + score_bonus
    let scoring_dice = scoring_dice_value_occurrence
    let non_scoring_dice = non_scoring_dice_from_std

    console.log("state " + score_std)

    return {
            score,
            scoring_dice,
            non_scoring_dice
    }
}


function sum(arrayToSum) {
    let sum = 0
    
    for (let i = 0; i < arrayToSum.length; i++) {
        sum += array[i]
    }
    return sum
}


function game_turn(is_interactive=true) {
    /* """ Handle a full player turn

        :parameters     current_player      dictionary of player information
                                            - 'name'
                                            - 'score'
                                            - 'lost_score'
                                            - 'nb_of_roll'
                                            - 'nb_of_turn'
                                            - 'nb_of_scoring_turn'
                                            - 'nb_of_non_scoring_turn'
                                            - 'nb_of_full_roll'

                        is_interactive      boolean for game mode
                                            - True -> interactive game mode
                                            - False -> random choice for game simulation

        :return:        updated dictionary of player information after a game turn
    """
    */

    // # turn start with the full set of dices
    let remaining_dice_to_roll = DEFAULT_DICES_NB
    let roll_again = true

    let turn_score = 0
    while (roll_again) {
        // # generate the dice roll and compute the scoring
        let dice_value_occurrence = roll_dice_set(remaining_dice_to_roll)
        let roll_score = analyse_score(dice_value_occurrence)
       // remaining_dice_to_roll = roll_score.non_scoring_dice.reduce(function (a, b) { return a + b; }, 0)
        remaining_dice_to_roll = sum(roll_score.non_scoring_dice)
       // remaining_dice_to_roll = sum(roll_score[2])


        if (roll_score.score == 0) {
            // # lost roll

            console.log('\n-->' + 'got zero point ' + turn_score + 'lost points\n')
            newQuote('\n-->' + 'got zero point ' + turn_score + 'lost points\n')


            roll_again = false
            turn_score = 0
        }
        else {
            // # scoring roll

            turn_score += roll_score.score

            // # In case of scoring roll and no remaining dice to roll the player can roll again the full set of dices
            if (remaining_dice_to_roll == 0) {
                remaining_dice_to_roll = DEFAULT_DICES_NB
                console.log('-->Full Roll')
                newQuote('-->Full Roll')
            }

            console.log(roll_score.score)
            console.log('Roll Score='+ roll_score.score + 'potential turn score='+ turn_score + 'remaining dice=' +
                  remaining_dice_to_roll)
            newQuote('Roll Score='+ roll_score.score + 'potential turn score='+ turn_score + 'remaining dice=' +
                  remaining_dice_to_roll)

            // # choice to roll again or stop and take roll score
            if (is_interactive) {
                // # interactive decision for real game
                newQuote("Do you want to roll this dice ? [y/n] ")
                stop_turn = input("Do you want to roll this dice ? [y/n] ") == "n"
            }
            else {
                // # random decision for game simulation (50/50)
                stop_turn = (random.randint(1, 100) % 2) == 0
            }

            if (stop_turn) {
                // # stop turn and take roll score

                console.log('\n-->' + 'Scoring turn with' + turn_score + 'points\n')
                newQuote('\n-->' + 'Scoring turn with' + turn_score + 'points\n')

                roll_again = false
            }
        }
    }

    return turn_score
}

function newQuote(quote) {
    const pElement = document.createElement('p')
    let node = document.createTextNode(quote)
    pElement.appendChild(node)
    let gameQuotesContener = document.getElementById('gameQuotes')
    gameQuotesContener.appendChild(pElement)
}


// # game_turn(True)

const PLAYERS = ["Jimy", "Lalita", "Ebonga"]
const NUMBER_OF_PLAYERS = PLAYERS.length
const NUMBER_OF_TURNS = 3

function multiplayerGame() {
    let turn_number = 1
    let score_board = [0]*NUMBER_OF_PLAYERS
    while (turn_number <= NUMBER_OF_TURNS) {
        console.log(turn_number)
        newQuote("Round 1")
        let player_id = 0
        while (player_id < NUMBER_OF_PLAYERS) {
            console.log(PLAYERS[player_id] + "'s turn")
            newQuote(PLAYERS[player_id] + "'s turn")
            let turn_score = game_turn(true)
            score_board[player_id] += turn_score
            console.log(score_board)
            newQuote(score_board)
            player_id += 1
        }
        turn_number += 1
    }
}


multiplayerGame(PLAYERS)


/* line 199 sum() is not working 
Variable roll_score line 198 cannot carry 3 return ?
*/ 
