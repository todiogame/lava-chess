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
                        description: "Drops a 2-cells net that roots targets."
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
                please_create_account : "Les comptes invit??s sont plafonn??s au niveau 5 et 1050 elo.<br/>Cr??ez un compte pour continuer ?? progresser !"
            }
        },
        general: {
            LAVA_SPELL: {
                name: "Faire monter la lave et passer le tour",
                description:
                    "Le temps passe et la lave monte ! Choisissez une cellule sur le bord de la carte pour la faire dispara??tre dans la lave.",
            },
            PASS_SPELL: {
                name: "Passer le tour",
                description: "Cliquez ici pour passer votre tour.",
            },
            MOVE_SPELL: {
                name: "Bouger",
                description: "Utilisez un point de mouvement pour vous d??placer vers une cellule adjacente.",
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
                            "Une aura de d??g??ts autour de l'Infernal. Se d??clenche au d??but du tour du D??moniste.",
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
                description: "Une cr??ature mort-vivante sans esprit. Lente, mais persistante.",
                spells: {
                    zombie_crawl: {
                        name: "Ramper",
                        description:
                            "Se d??place d'une cellule, ou effectue une attaque instantan??e qui tue ??galement le zombie.",
                    },
                },
            }
        },
        characters: {
            mage: {
                name: "Mage",
                title: "Ma??tre des ??l??ments",
                description:
                    "Ce puissant lanceur de sorts commande le pouvoir du feu et de la glace, maniant la capacit?? de d??cha??ner des frappes infernales et de lancer des mal??dictions glaciales, tout en repoussant les ennemis avec une puissante vague d'??nergie.",
                spells: [
                    {
                        name: "Frappe infernale",
                        description: "Inflige des d??g??ts dans une ligne droite."
                    },
                    {
                        name: "Gel instantan??",
                        description: "Immobilise instantan??ment les cibles dans une zone carr??e."
                    },
                    {
                        name: "Champ de force",
                        description: "Repousse tous ceux qui se trouvent autour du lanceur de sorts dans une zone circulaire."
                    }
                ]
            },
            fisherman: {
                name: "P??cheur",
                title: "Briseur de pub",
                description: "Ce marin exp??riment?? est capable d'attirer ses ennemis avec un bon coup de ligne, de les pi??ger dans un filet de p??che et de les repousser avec un coup de ventre qui inflige des d??g??ts.",
                spells: [
                    {
                        name: "Hame??on",
                        description: "Attire la premi??re cible en ligne droite."
                    },
                    {
                        name: "Filet de p??che",
                        description: "Lance un filet de 2 cases pour enraciner les cibles."
                    },
                    {
                        name: "Coup de bidon",
                        description: "Pousse la cible et inflige des d??g??ts instantan??s."
                    }
                ]
            },
            golem: {
                name: "Golem",
                title: "Force inarr??table de la nature",
                description:
                    "Cet ??tre ancien est une montagne vivante, maniant le pouvoir de la Terre et la capacit?? ?? invoquer des murs de lave et ?? faire tomber des ??clats de rocher qui peuvent infliger des d??g??ts d??vastateurs.",
                spells: [
                    {
                        name: "??clat de roche",
                        description: "Inflige des d??g??ts, mais si la cellule ??tait vide, fait monter de la lave.",
                    },
                    {
                        name: "Mur de lave",
                        description: "Invoque un mur autour d'une cellule cibl??e dans une zone ondul??e.",
                    },
                    {
                        name: "Explosion",
                        description: "Inflige des d??g??ts autour du lanceur de sorts.",
                    },
                ],
            },
            ninja: {
                name: "Ninja",
                title: "Ma??tre des ombres",
                description: "Ce guerrier ??nigmatique est entra??n?? dans l'art de la discr??tion et de la tromperie, capable de lancer des ombres et de d??cha??ner des coups tournoyants, se d??pla??ant ?? la vitesse de la foudre pour abattre ses ennemis.",
                spells: [
                    {
                        name: "Projetter l'ombre",
                        description: "Invoque une ombre qui peut lancer Coup tournoyant.",
                    },
                    {
                        name: "Coup tournoyant",
                        description:
                            "Inflige des d??g??ts instantan??s dans une zone circulaire autour du lanceur et de son ombre.",
                    },
                    {
                        name: "Ma??tre de l'illusion",
                        description: "??change les positions du lanceur et de son ombre.",
                    },
                ]
            },
            demonist: {
                name: "D??moniste",
                title: "Conjurateur des Enfers",
                description: "Ce praticien sombre puise sa force dans les d??mons, invoquant des tentacules et des infernaux pour ob??ir ?? ses ordres et semer le chaos parmi ses ennemis.",
                spells: [
                    {
                        name: "Appel du tentacule",
                        description: "Fait ??merger un tentacule qui inflige des d??g??ts en ligne."
                    },
                    {
                        name: "Invocation d'Infernal",
                        description: "Invoque un Infernal avec une aura br??lante."
                    },
                    {
                        name: "Coup de fouet",
                        description: "Accorde 1 point de mouvement suppl??mentaire ?? un alli??."
                    }
                ]
            },
            rasta: {
                name: "Rasta",
                title: "Le tireur aux tonneaux",
                description: "Ce combattant t??m??raire est toujours pr??t ?? tirer avec sa mitrailleuse, roulant des tonneaux explosifs vers ses ennemis et faisant une retraite rapide.",
                spells: [
                    {
                        name: "Salve de mitrailleuse",
                        description: "Inflige des d??g??ts en ligne droite."
                    },
                    {
                        name: "Tonneau roulant",
                        description: "Place un tonneau explosif."
                    },
                    {
                        name: "Retraite strat??gique",
                        description: "Accorde 2 points de mouvement suppl??mentaires au lanceur."
                    }
                ]
            },
            assassin: {
                name: "Assassin",
                title: "La tueuse silencieuse",
                description:
                    "Cette mercenaire ?? l'ombre d??guis??e est une reine de la tromperie, se faufilant jusqu'?? ses ennemis pour leur ass??ner un coup mortel, les abbattant de loin avec une arme ?? feu silencieuse ou disparaissant avec sa bombe fumig??ne.",
                spells: [
                    {
                        name: "Attaque directe",
                        description:
                            "Inflige des d??g??ts instantan??s ?? une seule cible ?? courte port??e.",
                    },
                    {
                        name: "Pistolet silencieux",
                        description:
                            "Inflige des d??g??ts instantan??s ?? une seule cible en ligne droite ?? 3 port??es.",
                    },
                    {
                        name: "Bombe fumig??ne",
                        description:
                            "Immobilise instantan??ment toutes les cibles ?? courte port??e et se d??place d'une cellule.",
                    },
                ],
            },
            time_traveler: {
                name: "Voyageur temporel",
                title: "Ma??tre de l'espace-temps",
                description: "Ce sorcier cosmique manipule le pouvoir du temps lui-m??me, capable d'invoquer des machines temporelles qui explosent et se t??l??portent, de frapper les ennemis proches avec des coups ?? l'envers et de les r??duire au silence.",
                spells: [
                    {
                        name: "Machine temporelle",
                        description: "Invoque une machine qui explose, infligeant des d??g??ts autour d'elle et t??l??portant le lanceur ?? son emplacement."
                    },
                    {
                        name: "Coup ?? l'envers",
                        description: "Inflige des d??g??ts instantan??s ?? une seule cible ?? courte port??e, le lanceur est alors pouss?? en arri??re."
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
                    "Cet obscur spiritualiste commande une arm??e de morts-vivants, invoquant des zombies d'un seul sort et r??pandant la peste ?? distance. Il peut ??galement maudire ses ennemis.",
                spells: [
                    {
                        name: "Arm??e des morts-vivants",
                        description: "R??v??le une tombe qui invoque un zombie au prochain tour.",
                    },
                    {
                        name: "Pestilence",
                        description: "Laisse un glyphe permanent qui inflige des d??g??ts",
                    },
                    {
                        name: "Mal??diction vaudou",
                        description: "Silence instantan??ment une seule cible.",
                    },
                ],
            },
            random: {
                name: "Al??atoire",
                title: "Personnage al??atoire",
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
                title: "Le d??fenseur armadillo",
                description:
                    "Ce mammif??re arm?? est un d??fenseur f??roce, capable de rouler en une boule ??pineuse pour infliger des d??g??ts, se prot??ger d'une posture d??fensive et pi??ger ses ennemis.",
                spells: [
                    {
                        name: "Boule ??pineuse",
                        description: "Gagne instantan??ment 1 point de mouvement et inflige des d??g??ts autour du lanceur.",
                    },
                    {
                        name: "Posture d??fensive",
                        description: "Prot??ge le lanceur.",
                    },
                    {
                        name: "Pi??ge",
                        description: "Laisse un pi??ge permanent qui immobilise les cibles.",
                    }
                ]
            },
            warrior: {
                name: "Guerrier",
                title: "Champion des batailles",
                description:
                    "Ce brave guerrier est un combattant habile, capable de d??cha??ner sa hache puissante, de prot??ger les alli??s sous son ??gide et de charger ?? la bataille pour repousser ses ennemis.",
                spells: [
                    {
                        name: "Hache",
                        description: "Frappe dans une AOE en forme de croissant en face du lanceur.",
                    },
                    {
                        name: "??gide",
                        description: "Prot??ge le lanceur et tous ceux autour de lui.",
                    },
                    {
                        name: "Charge",
                        description:
                            "Charge instantan??ment, inflige des d??g??ts et pousse la premi??re cible dans une ligne droite.",
                    },
                ],
            },
            gasser: {
                name: "Gazeur",
                title: "Criminel toxique",
                description:
                    "Cet ??tre nocif laisse un sillage de gaz toxiques partout o?? il va, et est capable d'augmenter sa mobilit?? et d'attaquer les cibles de pr??s avec un puissant coup de fusil charg?? de gaz.",
                spells: [
                    {
                        name: "Gaz Gaz Gaz",
                        description:
                            "Laisse passivement un sillage de gaz toxiques derri??re lui lorsqu'il se d??place (le lanceur y est immunis??).",
                    },
                    {
                        name: "Adr??naline",
                        description: "Accorde 2 points de mouvement suppl??mentaires au lanceur.",
                    },
                    {
                        name: "Souflette",
                        description:
                            "Inflige des d??g??ts instantan??s ?? une seule cible ?? courte port??e et ajoute du gaz ?? la cellule.",
                    },
                ],
            },


            lava_elemental: {
                name: "??l??mentaire de lave",
                title: "Furie du volcan",
                description: "Cet ??tre de feu commande le pouvoir de la roche fondue et peut d??cha??ner des ??ruptions de magma pour infliger des d??g??ts massifs, lib??rer des fum??es sulfureuses qui empoisonnent l'air ou se t??l??porter ?? travers la lave.",
                spells: [
                    {
                        name: "??ruption",
                        description: "Inflige des d??g??ts sur une zone pr??s de la lave.",
                    },
                    {
                        name: "Vapeurs de souffre",
                        description: "Inflige des d??g??ts sur une zone partout pr??s de la lave (le lanceur y est immunis??).",
                    },
                    {
                        name: "Flux de lave",
                        description: "Se t??l??porte n'importe o?? pr??s de la lave, faisant monter la lave derri??re lui.",
                    },
                ],
            },

            water_elemental: {
                name: "??l??mentaire d'eau",
                title: "Ma??tre des mers",
                description:
                    "Cet ??l??mentaire manie le pouvoir de l'oc??an et peut cr??er de puissants tourbillons et des vagues d??ferlantes pour d??vaster ses ennemis. Ils peuvent ??galement manipuler l'eau pour d??placer des combattants et changer le cours de la bataille.",
                spells: [
                    {
                        name: "Tourbillon",
                        description: "Inflige des d??g??ts sur une zone en forme d'anneau.",
                    },
                    {
                        name: "??claboussure",
                        description: "Pousse une cible dans une direction choisie, restaurant le sol sous elle pour la prot??ger de la lave.",
                    },
                    {
                        name: "Vague d??ferlante",
                        description: "Inflige des d??g??ts sur une zone en forme de croissant, qui avance chaque tour.",
                    },
                ]
            },
            ethereal: {
                name: "??th??r??",
                title: "Silhouette spectrale",
                description: "Cette silhouette fantomatique peut passer ?? une forme ??th??r??e, devenant immunis??e contre tout d??g??t instantan?? des attaques ennemies. Il a ??galement une frappe spectrale mortelle qui peut infliger des d??g??ts aux ennemis proches.",
                spells: [
                    {
                        name: "Forme ??th??r??e",
                        description: "Devient ??th??r??, gagnant un point de mouvement et devenant immunis?? contre les d??g??ts instantan??s pendant un tour."
                    },
                    {
                        name: "Frappe spectrale",
                        description: "Inflige des d??g??ts instantan??s ?? une cible ?? port??e courte."
                    },
                    {
                        name: "Hante",
                        description: "Inflige des d??g??ts sur une cible et dans une zone autour."
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