// Object to store language-specific strings
const LANGUAGES = {
    en: {
        ui: {
            landing_page: {
                please_create_account : "Guest accounts are capped at level 5 and 1050 elo.<br/>Create an account to play further!"
            }
        },
        general: {
            LAVA_SPELL: {
                name: "Raise lava and pass turn",
                description:
                    "Time is ticking and lava is rising! Choose a cell on the edge of the map to make it disappear in the lava.",
            },
            PASS_SPELL: {
                name: "Pass turn",
                description: "Click here to pass your turn.",
            },
            MOVE_SPELL: {
                name: "Move",
                description: "Use a movement point to move to an adjacent cell.",
            },
        },

        summons: {
            shadow: {
                name: "Shadow",
            },
            wall: {
                name: "Wall",
            },
            tentacle: {
                name: "Tentacle",
                auras: [
                    {
                        name: "Tentacle Hit",
                    },
                ],
            },
            infernal: {
                name: "Infernal",
                auras: [
                    {
                        name: "Flame aura",
                    },
                ],
                spells: [
                    {
                        name: "Flame aura",
                        description:
                            "A damaging aura around the Infernal. Procs at the start of the Demonist's turn.",
                    },
                ],
            },
            barrel: {
                name: "Barrel",
                auras: [
                    {
                        name: "Close to barrel",
                    },
                ],
            },
            time_machine: {
                name: "Time Machine",
                auras: {
                    time_machine: {
                        name: "Time Machine",
                    },
                    explosion: {
                        name: "Explosion",
                    },
                },
            },
            zombie: {
                name: "Zombie",
                description: "A mindless undead creature. Slow, but persistent.",
                spells: {
                    zombie_crawl: {
                        name: "Zombie Crawl",
                        description:
                            "Moves one cell, or deals an instant attack that also kills the zombie.",
                    },
                },
            }
        },
        characters: {
            mage: {
                name: "Mage",
                title: "Master of the Elements",
                description:
                    "This skilled spellcaster commands the power of fire and ice, wielding the ability to unleash inferno strikes and freezing curses, while forcing enemies away with a powerful wave of energy.",
                spells: [
                    {
                        name: "Inferno Strike",
                        description: "Deals damage in a straight line."
                    },
                    {
                        name: "Freezing Curse",
                        description: "Instantly roots targets in a square area."
                    },
                    {
                        name: "Force Wave",
                        description: "Pushes out anyone around the caster in a ring area."
                    }
                ]
            },
            fisherman: {
                name: "Fisherman",
                title: "Pub Smasher",
                description: "This experienced seaman is capable of pulling in foes with a well-placed hook, trapping them in a fishing net, and pushing them away with a belly bump that deals damage.",
                spells: [
                    {
                        name: "Bait Hook",
                        description: "Pulls first target in a straight line."
                    },
                    {
                        name: "Fishing Net",
                        description: "Drops a 2-cells net that roots targets who start their turn inside."
                    },
                    {
                        name: "Belly Bump",
                        description: "Pushes target and deals instant damage."
                    }
                ]
            },
            golem: {
                name: "Golem",
                title: "Unstoppable force of nature",
                description:
                    "This ancient being is a living construct, wielding the power of the earth and the ability to summon magma walls and perform boulder smashes that can inflict devastating damage.",
                spells: [
                    {
                        name: "Boulder Smash",
                        description: "Deals damage, but if the cell was empty, rise lava.",
                    },
                    {
                        name: "Magma Wall",
                        description: "Summons a wall in a curly area around a targeted cell.",
                    },
                    {
                        name: "Explosion",
                        description: "Deals damage around the caster.",
                    },
                ],
            },
            ninja: {
                name: "Ninja",
                title: "Master of shadows",
                description: "This enigmatic warrior is trained in the art of stealth and deception, able to cast shadows and unleash spinning slashes, moving with lightning speed to take down their enemies.",
                spells: [
                    {
                        name: "Cast Shadow",
                        description: "Summons a shadow that can cast Spinning Slash.",
                    },
                    {
                        name: "Spinning Slash",
                        description:
                            "Deals instant damage in a circular area around the caster and its shadow.",
                    },
                    {
                        name: "Master of Illusion",
                        description: "Swaps the positions of the caster and its shadow.",
                    },
                ]
            },
            demonist: {
                name: "Demonist",
                title: "Conjurer of the Underworld",
                description: "This dark practitioner draws on the power of demons, summoning tentacles and infernals to do their bidding and wreak havoc on their enemies.",
                spells: [
                    {
                        name: "Spawn Tentacle",
                        description: "Spawns a tentacle that damages in a line."
                    },
                    {
                        name: "Summon Infernal",
                        description: "Summons an infernal with a burning aura."
                    },
                    {
                        name: "Speed Boost",
                        description: "Grants 1 more movement point to an ally."
                    }
                ]
            },
            rasta: {
                name: "Rasta",
                title: "The barrel-wielding shooter",
                description: "This fearless fighter is always ready to fire with their gatling shot, rolling explosive barrels towards enemies, and making a quick retreat.",
                spells: [
                    {
                        name: "Gatling Shot",
                        description: "Deals damage in a straight line."
                    },
                    {
                        name: "Rolling Barrel",
                        description: "Places explosive barrel."
                    },
                    {
                        name: "Jamming Retreat",
                        description: "Grants 2 more movement points to the caster."
                    }
                ]
            },
            assassin: {
                name: "Assassin",
                title: "The silent killer",
                description:
                    "This shadow-clad warrior is a master of deception, sneaking up on their enemies to land a deadly backstab, shooting them from a distance with a silent handgun, or disappearing in a cloud of smoke with their smoke bomb.",
                spells: [
                    {
                        name: "Backstab",
                        description:
                            "Deals instant damage to a single target in close range.",
                    },
                    {
                        name: "Silent Bullet",
                        description:
                            "Deals instant damage to a single target in a straight line at 3 range.",
                    },
                    {
                        name: "Smoke bomb",
                        description:
                            "Instantly roots all targets at close range and moves one cell.",
                    },
                ],
            },
            time_traveler: {
                name: "Time Traveler",
                title: "Master of Temporal Magic",
                description: "This cosmic wizard wields the power of time itself, able to summon time machines that explode and teleport, strike enemies with backwards hits, and silence foes with lances of silence.",
                spells: [
                    {
                        name: "Time Machine",
                        description: "Summons a time machine that explodes next turn, dealing damage around it and teleporting the caster to its location."
                    },
                    {
                        name: "Backwards Hit",
                        description: "Deals instant damage to a single target in close range, the caster then gets pushed backwards."
                    },
                    {
                        name: "Silence Lance",
                        description: "Silences in a handspinner area."
                    }
                ]
            },
            shaman: {
                name: "Shaman",
                title: "Keeper of the Dead",
                description:
                    "This mysterious spiritualist commands an undead army, calling forth zombies with a single spells and spreading pestilence with a dark glyph. They can also curse their enemies with voodoo magic.",
                spells: [
                    {
                        name: "Undead Army",
                        description: "Reveals a tombstone that summons a zombie next turn.",
                    },
                    {
                        name: "Pestilence",
                        description: "Drops a permanent glyph that deals damage",
                    },
                    {
                        name: "Voodoo Curse",
                        description: "Instantly silences a single target.",
                    },
                ],
            },
            random: {
                name: "Random",
                title: "Random Character",
                description: "Try your luck !",
                spells: [
                    {
                        name: "?",
                        description: "???",
                    },
                    {
                        name: "?",
                        description: "???",
                    },
                    {
                        name: "?",
                        description: "???",
                    },
                ],
            },
            pangolino: {
                name: "Pangolino",
                title: "The Armadillo Defender",
                description:
                    "This armored mammal is a fierce defender, capable of rolling into a spiky ball to deal damage, shielding themselves with a defensive stance, and setting booby traps to ensnare their enemies.",
                spells: [
                    {
                        name: "Spiky Ball",
                        description: "Instantly gains 1 movement point and will deal damage around the caster.",
                    },
                    {
                        name: "Defensive stance",
                        description: "Shields the caster.",
                    },
                    {
                        name: "Booby Trap",
                        description: "Drops a lasting trap that roots targets.",
                    }
                ]
            },
            warrior: {
                name: "Warrior",
                title: "Champion of Battle",
                description:
                    "This brave warrior is a skilled combatant, able to unleash powerful cleaves, protect allies with an aegis, and charge into battle to push their enemies back.",
                spells: [
                    {
                        name: "Cleave",
                        description: "Hits in a curly AOE in front of the caster.",
                    },
                    {
                        name: "Aegis",
                        description: "Shields the caster and everybody around him.",
                    },
                    {
                        name: "Charge",
                        description:
                            "Instantly charges, damages and pushes the first target in a straight line.",
                    },
                ],
            },
            gasser: {
                name: "Gasser",
                title: "Toxic Troublemaker",
                description:
                    "This noxious being leaves a trail of poisonous gas wherever they go, and is able to increase their mobility and attack targets up close with a powerful shotgun blast.",
                spells: [
                    {
                        name: "Gas gas gas",
                        description:
                            "Passively leaves a trail of toxic gas behind him when moving (the caster is immune to the gas).",
                    },
                    {
                        name: "Adrenaline",
                        description: "Grants 2 more movement points to the caster.",
                    },
                    {
                        name: "Shotgun",
                        description:
                            "Deals instant damage to a single target in close range and add gas to the cell.",
                    },
                ],
            },

            lava_elemental: {
                name: "Lava Elemental",
                title: "Fury of the Volcano",
                description: "This fiery being commands the power of molten rock and can unleash eruptions of magma to deal massive damage, release sulfurous fumes that poison the air, or teleport through lava to escape his ennemies.",
                spells: [
                    {
                        name: "Eruption",
                        description: "Deals area damage anywhere close to the lava.",
                    },
                    {
                        name: "Sulfur Fumes",
                        description: "Deals area damage everywhere close to the lava (the caster is immune to the fumes).",
                    },
                    {
                        name: "Lava flow",
                        description: "Teleports anywhere near the lava, rising lava behind him.",
                    },
                ],
            },

            water_elemental: {
                name: "Water Elemental",
                title: "Master of the seas",
                description:
                    "This elemental wields the power of the ocean and can create powerful whirlpools and crashing waves to devastate their foes. They can also manipulate water to push their enemies away and create safe zones amidst treacherous terrain.",
                spells: [
                    {
                        name: "Whirlpool",
                        description: "Deals damage in a ring area.",
                    },
                    {
                        name: "Splash",
                        description: "Pushes a target in a chosen direction, restoring floor beneath them to protect them from lava.",
                    },
                    {
                        name: "Breaking Wave",
                        description: "Deals damage in a curly area, that goes forward every turn.",
                    },
                ]
            },
            ethereal: {
                name: "Ethereal",
                title: "The Ghostly Figure",
                description: "This phantom figure can shift to an ethereal form, becoming immune to any instant damage to avoid enemy attacks. They also have a deadly ghostly strike that can deal massive damage to enemies.",
                spells: [
                    {
                        name: "Ethereal Form",
                        description: "Becomes ethereal, gaining one movement point and becoming immune to instant damage for one turn."
                    },
                    {
                        name: "Ghostly Strike",
                        description: "Deals instant damage to a single target in close range."
                    },
                    {
                        name: "Haunt",
                        description: "Deal damage on a target in a handspinner area."
                    },
                ]
            },
        },
    },











    //FRANCAIS


    fr: {
        ui: {
            landing_page: {
                please_create_account : "Les comptes invités sont plafonnés au niveau 5 et 1050 elo.<br/>Créez un compte pour continuer à progresser !"
            }
        },
        general: {
            LAVA_SPELL: {
                name: "Faire monter la lave et passer le tour",
                description:
                    "Le temps passe et la lave monte ! Choisissez une cellule sur le bord de la carte pour la faire disparaître dans la lave.",
            },
            PASS_SPELL: {
                name: "Passer le tour",
                description: "Cliquez ici pour passer votre tour.",
            },
            MOVE_SPELL: {
                name: "Bouger",
                description: "Utilisez un point de mouvement pour vous déplacer vers une cellule adjacente.",
            },
        },
        summons: {
            shadow: {
                name: "Ombre",
            },
            wall: {
                name: "Mur",
            },
            tentacle: {
                name: "Tentacule",
                auras: [
                    {
                        name: "Coup de tentacule",
                    },
                ],
            },
            infernal: {
                name: "Infernal",
                auras: [
                    {
                        name: "Aura de flamme",
                    },
                ],
                spells: [
                    {
                        name: "Aura de flamme",
                        description:
                            "Une aura de dégâts autour de l'Infernal. Se déclenche au début du tour du Démoniste.",
                    },
                ],
            },
            barrel: {
                name: "Baril",
                auras: [
                    {
                        name: "Proche du baril",
                    },
                ],
            },
            time_machine: {
                name: "Machine temporelle",
                auras: {
                    time_machine: {
                        name: "Machine temporelle",
                    },
                    explosion: {
                        name: "Explosion",
                    },
                },
            },
            zombie: {
                name: "Zombie",
                description: "Une créature mort-vivante sans esprit. Lente, mais persistante.",
                spells: {
                    zombie_crawl: {
                        name: "Ramper",
                        description:
                            "Se déplace d'une cellule, ou effectue une attaque instantanée qui tue également le zombie.",
                    },
                },
            }
        },
        characters: {
            mage: {
                name: "Mage",
                title: "Maître des Éléments",
                description:
                    "Ce puissant lanceur de sorts commande le pouvoir du feu et de la glace, maniant la capacité de déchaîner des frappes infernales et de lancer des malédictions glaciales, tout en repoussant les ennemis avec une puissante vague d'énergie.",
                spells: [
                    {
                        name: "Frappe infernale",
                        description: "Inflige des dégâts dans une ligne droite."
                    },
                    {
                        name: "Gel instantané",
                        description: "Immobilise instantanément les cibles dans une zone carrée."
                    },
                    {
                        name: "Champ de force",
                        description: "Repousse tous ceux qui se trouvent autour du lanceur de sorts dans une zone circulaire."
                    }
                ]
            },
            fisherman: {
                name: "Pêcheur",
                title: "Briseur de pub",
                description: "Ce marin expérimenté est capable d'attirer ses ennemis avec un bon coup de ligne, de les piéger dans un filet de pêche et de les repousser avec un coup de ventre qui inflige des dégâts.",
                spells: [
                    {
                        name: "Hameçon",
                        description: "Tire le premier cible dans une ligne droite."
                    },
                    {
                        name: "Filet de pêche",
                        description: "Lâche un filet de 2 cases qui enracinera les cibles qui commencent leur tour à l'intérieur."
                    },
                    {
                        name: "Coup de bidon",
                        description: "Pousse la cible et inflige des dégâts instantanés."
                    }
                ]
            },
            golem: {
                name: "Golem",
                title: "Force inarrêtable de la nature",
                description:
                    "Cet être ancien est une montagne vivante, maniant le pouvoir de la Terre et la capacité à invoquer des murs de lave et à faire tomber des éclats de rocher qui peuvent infliger des dégâts dévastateurs.",
                spells: [
                    {
                        name: "Éclat de roche",
                        description: "Inflige des dégâts, mais si la cellule était vide, fait monter de la lave.",
                    },
                    {
                        name: "Mur de lave",
                        description: "Invoque un mur autour d'une cellule ciblée dans une zone ondulée.",
                    },
                    {
                        name: "Explosion",
                        description: "Inflige des dégâts autour du lanceur de sorts.",
                    },
                ],
            },
            ninja: {
                name: "Ninja",
                title: "Maître des ombres",
                description: "Ce guerrier énigmatique est entraîné dans l'art de la discrétion et de la tromperie, capable de lancer des ombres et de déchaîner des coups tournoyants, se déplaçant à la vitesse de la foudre pour abattre ses ennemis.",
                spells: [
                    {
                        name: "Projetter l'ombre",
                        description: "Invoque une ombre qui peut lancer Coup tournoyant.",
                    },
                    {
                        name: "Coup tournoyant",
                        description:
                            "Inflige des dégâts instantanés dans une zone circulaire autour du lanceur et de son ombre.",
                    },
                    {
                        name: "Maître de l'illusion",
                        description: "Échange les positions du lanceur et de son ombre.",
                    },
                ]
            },
            demonist: {
                name: "Démoniste",
                title: "Conjurateur des Enfers",
                description: "Ce praticien sombre puise sa force dans les démons, invoquant des tentacules et des infernaux pour obéir à ses ordres et semer le chaos parmi ses ennemis.",
                spells: [
                    {
                        name: "Appel du tentacule",
                        description: "Fait émerger un tentacule qui inflige des dégâts en ligne."
                    },
                    {
                        name: "Invocation d'Infernal",
                        description: "Invoque un Infernal avec une aura brûlante."
                    },
                    {
                        name: "Coup de fouet",
                        description: "Accorde 1 point de mouvement supplémentaire à un allié."
                    }
                ]
            },
            rasta: {
                name: "Rasta",
                title: "Le tireur aux tonneaux",
                description: "Ce combattant téméraire est toujours prêt à tirer avec sa mitrailleuse, roulant des tonneaux explosifs vers ses ennemis et faisant une retraite rapide.",
                spells: [
                    {
                        name: "Salve de mitrailleuse",
                        description: "Inflige des dégâts en ligne droite."
                    },
                    {
                        name: "Tonneau roulant",
                        description: "Place un tonneau explosif."
                    },
                    {
                        name: "Retraite stratégique",
                        description: "Accorde 2 points de mouvement supplémentaires au lanceur."
                    }
                ]
            },
            assassin: {
                name: "Assassin",
                title: "La tueuse silencieuse",
                description:
                    "Cette mercenaire à l'ombre déguisée est une reine de la tromperie, se faufilant jusqu'à ses ennemis pour leur asséner un coup mortel, les abbattant de loin avec une arme à feu silencieuse ou disparaissant avec sa bombe fumigène.",
                spells: [
                    {
                        name: "Attaque directe",
                        description:
                            "Inflige des dégâts instantanés à une seule cible à courte portée.",
                    },
                    {
                        name: "Pistolet silencieux",
                        description:
                            "Inflige des dégâts instantanés à une seule cible en ligne droite à 3 portées.",
                    },
                    {
                        name: "Bombe fumigène",
                        description:
                            "Immobilise instantanément toutes les cibles à courte portée et se déplace d'une cellule.",
                    },
                ],
            },
            time_traveler: {
                name: "Voyageur temporel",
                title: "Maître de l'espace-temps",
                description: "Ce sorcier cosmique manipule le pouvoir du temps lui-même, capable d'invoquer des machines temporelles qui explosent et se téléportent, de frapper les ennemis proches avec des coups à l'envers et de les réduire au silence.",
                spells: [
                    {
                        name: "Machine temporelle",
                        description: "Invoque une machine du temps qui explose la prochaine fois, infligeant des dégâts autour d'elle et téléportant le lanceur à son emplacement."
                    },
                    {
                        name: "Coup à l'envers",
                        description: "Inflige des dégâts instantanés à une seule cible à courte portée, le lanceur est alors poussé en arrière."
                    },
                    {
                        name: "Lance de silence",
                        description: "Silence en zone."
                    }
                ]
            },
            shaman: {
                name: "Chaman",
                title: "Gardien des morts",
                description:
                    "Cet obscur spiritualiste commande une armée de morts-vivants, invoquant des zombies d'un seul sort et répandant la peste à distance. Il peut également maudire ses ennemis.",
                spells: [
                    {
                        name: "Armée des morts-vivants",
                        description: "Révèle une tombe qui invoque un zombie au prochain tour.",
                    },
                    {
                        name: "Pestilence",
                        description: "Laisse un glyphe permanent qui inflige des dégâts",
                    },
                    {
                        name: "Malédiction vaudou",
                        description: "Silence instantanément une seule cible.",
                    },
                ],
            },
            random: {
                name: "Aléatoire",
                title: "Personnage aléatoire",
                description: "Tentez votre chance !",
                spells: [
                    {
                        name: "?",
                        description: "???",
                    },
                    {
                        name: "?",
                        description: "???",
                    },
                    {
                        name: "?",
                        description: "???",
                    },
                ],
            },
            pangolino: {
                name: "Pangolino",
                title: "Le défenseur armadillo",
                description:
                    "Ce mammifère armé est un défenseur féroce, capable de rouler en une boule épineuse pour infliger des dégâts, se protéger d'une posture défensive et piéger ses ennemis.",
                spells: [
                    {
                        name: "Boule épineuse",
                        description: "Gagne instantanément 1 point de mouvement et inflige des dégâts autour du lanceur.",
                    },
                    {
                        name: "Posture défensive",
                        description: "Protège le lanceur.",
                    },
                    {
                        name: "Piège",
                        description: "Laisse un piège permanent qui immobilise les cibles.",
                    }
                ]
            },
            warrior: {
                name: "Guerrier",
                title: "Champion des batailles",
                description:
                    "Ce brave guerrier est un combattant habile, capable de déchaîner sa hache puissante, de protéger les alliés sous son égide et de charger à la bataille pour repousser ses ennemis.",
                spells: [
                    {
                        name: "Hache",
                        description: "Frappe dans une AOE en forme de croissant en face du lanceur.",
                    },
                    {
                        name: "Égide",
                        description: "Protège le lanceur et tous ceux autour de lui.",
                    },
                    {
                        name: "Charge",
                        description:
                            "Charge instantanément, inflige des dégâts et pousse la première cible dans une ligne droite.",
                    },
                ],
            },
            gasser: {
                name: "Gazeur",
                title: "Criminel toxique",
                description:
                    "Cet être nocif laisse un sillage de gaz toxiques partout où il va, et est capable d'augmenter sa mobilité et d'attaquer les cibles de près avec un puissant coup de fusil chargé de gaz.",
                spells: [
                    {
                        name: "Gaz Gaz Gaz",
                        description:
                            "Laisse passivement un sillage de gaz toxiques derrière lui lorsqu'il se déplace (le lanceur y est immunisé).",
                    },
                    {
                        name: "Adrénaline",
                        description: "Accorde 2 points de mouvement supplémentaires au lanceur.",
                    },
                    {
                        name: "Souflette",
                        description:
                            "Inflige des dégâts instantanés à une seule cible à courte portée et ajoute du gaz à la cellule.",
                    },
                ],
            },


            lava_elemental: {
                name: "Élémentaire de lave",
                title: "Furie du volcan",
                description: "Cet être de feu commande le pouvoir de la roche fondue et peut déchaîner des éruptions de magma pour infliger des dégâts massifs, libérer des fumées sulfureuses qui empoisonnent l'air ou se téléporter à travers la lave.",
                spells: [
                    {
                        name: "Éruption",
                        description: "Inflige des dégâts sur une zone près de la lave.",
                    },
                    {
                        name: "Vapeurs de souffre",
                        description: "Inflige des dégâts sur une zone partout près de la lave (le lanceur y est immunisé).",
                    },
                    {
                        name: "Flux de lave",
                        description: "Se téléporte n'importe où près de la lave, faisant monter la lave derrière lui.",
                    },
                ],
            },

            water_elemental: {
                name: "Élémentaire d'eau",
                title: "Maître des mers",
                description:
                    "Cet élémentaire manie le pouvoir de l'océan et peut créer de puissants tourbillons et des vagues déferlantes pour dévaster ses ennemis. Ils peuvent également manipuler l'eau pour déplacer des combattants et changer le cours de la bataille.",
                spells: [
                    {
                        name: "Tourbillon",
                        description: "Inflige des dégâts sur une zone en forme d'anneau.",
                    },
                    {
                        name: "Éclaboussure",
                        description: "Pousse une cible dans une direction choisie, restaurant le sol sous elle pour la protéger de la lave.",
                    },
                    {
                        name: "Vague déferlante",
                        description: "Inflige des dégâts sur une zone en forme de croissant, qui avance chaque tour.",
                    },
                ]
            },
            ethereal: {
                name: "Éthéré",
                title: "Silhouette spectrale",
                description: "Cette silhouette fantomatique peut passer à une forme éthérée, devenant immunisée contre tout dégât instantané des attaques ennemies. Il a également une frappe spectrale mortelle qui peut infliger des dégâts aux ennemis proches.",
                spells: [
                    {
                        name: "Forme éthérée",
                        description: "Devient éthéré, gagnant un point de mouvement et devenant immunisé contre les dégâts instantanés pendant un tour."
                    },
                    {
                        name: "Frappe spectrale",
                        description: "Inflige des dégâts instantanés à une cible à portée courte."
                    },
                    {
                        name: "Hante",
                        description: "Inflige des dégâts sur une cible et dans une zone autour."
                    },
                ]
            },
        }
    }
};
// Get the user's preferred language
// const language = (typeof window != "undefined" && window.document) ?
//     navigator.language.split("-")[0] : "en"

const language = "fr"
// Load the appropriate language-specific strings
const strings = LANGUAGES[language] || LANGUAGES["en"];

// console.log(strings)
module.exports = strings;