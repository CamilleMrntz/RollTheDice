// function multiplayerGame() {
//     // add a new quote
//     newQuote("Multiplayer game");
//     setTimeout(function() {
//     // prompt for number of players
//     let numberOfPlayers = prompt("How many players?");
//     // prompt for number of turns
//     let numberOfTurns = prompt("How many turns?");
//     // insert a new quote about the number of players and turns
//     newQuote(`Number of players: ${numberOfPlayers}`);
//     newQuote(`Number of turns: ${numberOfTurns}`);
//       }, 0);


// }

let playing = true

function getInputValue(value) {
    let val = value;
    return val;
  }



const NB_DICE_SIDE = 6; // # Nb of side of the Dices;
const SCORING_DICE_VALUE = [1, 5]; // # list_value of the side values of the dice who trigger a standard score;
const SCORING_MULTIPLIER = [100, 50]; // # list_value of multiplier for standard score;

const THRESHOLD_BONUS = 3; // # Threshold of the triggering for bonus in term of occurrence of the same slide value;
const STD_BONUS_MULTIPLIER = 100; // # Standard multiplier for bonus;
const ACE_BONUS_MULTIPLIER = 1000; // # Special multiplier for aces bonus;

const DEFAULT_DICES_NB = 5; // # Number of dices by default in the set;

function roll_dice_set(nb_dice_to_roll) {
  let dice_value_occurrence = Array(NB_DICE_SIDE).fill(0);
  let dice_index = 0;

  while (dice_index < nb_dice_to_roll) {
    let dice_value = Math.floor(Math.random() * (NB_DICE_SIDE - 1 + 1)) + 1;
    dice_value_occurrence[dice_value - 1] += 1;
    dice_index += 1;
  }

  return dice_value_occurrence;
}

function analyse_bonus_score(dice_value_occurrence) {
  let scoring_dice_value_occurrence = Array(NB_DICE_SIDE).fill(0);

  let bonus_score = 0;
  let side_value_index = 0;
  let bonus_multiplier = 1;

  while (side_value_index < dice_value_occurrence.length) {
    let side_value_occurrence = dice_value_occurrence[side_value_index];

    let nb_of_bonus = Math.floor(side_value_occurrence / THRESHOLD_BONUS);

    if (nb_of_bonus > 0) {
      if (side_value_index == 0) {
        bonus_multiplier = ACE_BONUS_MULTIPLIER;
      } else {
        bonus_multiplier = STD_BONUS_MULTIPLIER;
      }

      bonus_score += nb_of_bonus * bonus_multiplier * (side_value_index + 1);

      // # update the occurrence list after bonus rules for scoring dices and non scoring dices
      dice_value_occurrence[side_value_index] %= THRESHOLD_BONUS;
      scoring_dice_value_occurrence[side_value_index] = nb_of_bonus * THRESHOLD_BONUS;
    }

    side_value_index += 1;
  }

  let score = bonus_score;
  let scoring_dice = scoring_dice_value_occurrence;
  let non_scoring_dice = dice_value_occurrence;

  return {
    score,
    scoring_dice,
    non_scoring_dice,
  };
}


function analyse_standard_score(dice_value_occurrence) {


    let scoring_dice_value_occurrence = Array(NB_DICE_SIDE).fill(0);
    let scoring_multiplier = []

    let standard_score = 0
    let scoring_dice_value_index = 0
    while (scoring_dice_value_index < SCORING_DICE_VALUE.length) {
        let scoring_value = SCORING_DICE_VALUE[scoring_dice_value_index]
        let scoring_multiplier = SCORING_MULTIPLIER[scoring_dice_value_index]

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
        sum += arrayToSum[i]
    }
    return sum
}


function game_turn() {


    // # turn start with the full set of dices
    let remaining_dice_to_roll = DEFAULT_DICES_NB
    let roll_again = true
    let turn_score = 0

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
            return turn_score
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
            newQuote('Roll Score='+ roll_score.score + 'potential turn score='+ turn_score + 'remaining dice=' +
                  remaining_dice_to_roll)
                // stop_turn = input("Do you want to roll this dice ? [y/n] ") == "n"
                setTimeout(function() {
                    stop_turn = !confirm('Roll Score = '+ roll_score.score + ' potential turn score = '+ turn_score + ' remaining dice = ' +
                    remaining_dice_to_roll + " Do you want to roll this dice ? [y/n] ")
                    console.log(stop_turn)

                    if (stop_turn) {
                        // # stop turn and take roll score
        
                        console.log('\n-->' + 'Scoring turn with' + turn_score + 'points\n')
                        newQuote('\n-->' + 'Scoring turn with' + turn_score + 'points\n')
        
                        roll_again = false
                        playing = true
                        return turn_score
                    } else {
                        // # continue turn and roll again
                        console.log('-->Continue Roll')
                        newQuote('-->Continue Roll')
                        roll_again = true
                        console.log(roll_again)
                        game_turn()
                    }

                    playing = true

                }, 0); 
                return turn_score
        }


}




// # game_turn(True)

const PLAYERS = ["Jimy", "Lalita", "Ebonga"]
const NUMBER_OF_PLAYERS = PLAYERS.length
const NUMBER_OF_TURNS = 2


function multiplayerGame() {
    let turn_number = 1;
    let score_board = Array(NUMBER_OF_PLAYERS).fill(0);
    let player_id = 0;
  
    function playTurn() {
      newQuote("Round " + turn_number);
      newQuote(PLAYERS[player_id] + "'s turn");
  
      setTimeout(function() {
        let turn_score = game_turn();
        score_board[player_id] += turn_score;
        newQuote(score_board);
  
        player_id++;
        if (player_id >= NUMBER_OF_PLAYERS) {
          player_id = 0;
          turn_number++;
        }
  
        if (turn_number > NUMBER_OF_TURNS) {
          newQuote("Game over");
          return;
        }
  
        setTimeout(playTurn, 1000);
      }, 1000);
    }
  
    setTimeout(playTurn, 1000);
  }
  
  // problems : 
  // - if we roll again, the game switches to the next player
  // - the game over message is displayed before the last turn is played

//   function multiplayerGame() {
//     let turn_number = 1;
//     let score_board = Array(NUMBER_OF_PLAYERS).fill(0);
//     let player_id = 0;
  
//     function playTurn(callback) {
//       newQuote("Round " + turn_number);
//       newQuote(PLAYERS[player_id] + "'s turn");
  
//       setTimeout(function() {
//         let turn_score = game_turn();
//         score_board[player_id] += turn_score;
//         newQuote(score_board);
  
//         if (callback) {
//           callback();
//         }
//       }, 1000);
//     }
  
//     function playNextTurn() {
//       player_id++;
//       if (player_id >= NUMBER_OF_PLAYERS) {
//         player_id = 0;
//         turn_number++;
//       }
//       if (turn_number <= NUMBER_OF_TURNS) {
//         playTurn(playNextTurn); // call playTurn recursively if needed
//       } else {
//         setTimeout(function() {
//           newQuote("Game over");
//         }, 1000);
//       }
//     }
  
//     playTurn(playNextTurn); // start the game by calling playTurn
//   }
  
  

function newQuote(quote) {
    let pElement = document.createElement("p");
    let node = document.createTextNode(quote);
    pElement.appendChild(node);
    let gameQuotesContener = document.getElementById("gameQuotes");
  
    // Supprime toutes les citations précédentes
    // while (gameQuotesContener.firstChild) {
    //     gameQuotesContener.removeChild(gameQuotesContener.firstChild)
    // }
  
    // Ajoute la nouvelle citation
    gameQuotesContener.appendChild(pElement);
}
