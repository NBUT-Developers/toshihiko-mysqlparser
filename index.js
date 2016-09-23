/**
 * XadillaX created at 2016-09-23 11:41:52 With ♥
 *
 * Copyright (c) 2016 Souche.com, all rights
 * reserved.
 */
"use strict";

const keywords = require("./keyword");

/**
 * process quote
 * @param {String} sql the sql string
 * @param {Number} startIdx quote start index
 * @returns {Number} the length inner quotes
 */
function processQuote(sql, startIdx) {
    const start = sql[startIdx];
    for(let i = startIdx + 1; i < sql.length; i++) {
        if(sql[i] === "\\") {
            i++;
            continue;
        }

        if(sql[i] === start) {
            return i;
        }
    }

    return sql.length;
}

/**
 * process fragment
 * @param {String} fragment fragment string
 * @param {Object} map the map object
 * @param {Boolean} forceChange if need force change
 * @returns {String} the fragment result string
 */
function processFragment(fragment, map, forceChange) {
    if(forceChange) {
        if(map[fragment]) {
            return map[fragment];
        } else {
            return fragment;
        }
    } else {
        // see if it's a keyword
        if(keywords.indexOf(fragment.toUpperCase()) !== -1) {
            return fragment;
        } else {
            if(map[fragment]) {
                return map[fragment];
            } else {
                return fragment;
            }
        }
    }
}

/**
 * parse sql: name to column via map
 * @param {String} sql the sql string
 * @param {Object} map the map object
 * @returns {String} the new sql string
 */
exports.sqlNameToColumn = function(sql, map) {
    let result = "";
    let current = "";

    for(let i = 0; i < sql.length; i++) {
        if(sql[i] === "\"" || sql[i] === "'") {
            if(current) {
                result += processFragment(current, map);
                current = "";
            }

            const end = processQuote(sql, i);
            const wrap = sql.substring(i, end + 1);

            result += wrap;
            i = end;
        } else if(sql[i] === ",") {
            if(current) {
                result += processFragment(current, map);
                current = "";
            }
            result += ",";
        } else if(sql[i] === " ") {
            if(current) {
                result += processFragment(current, map);
                current = "";
            }
            result += " ";
        } else if(sql[i] === "(") {
            if(current) {
                // current + '(',
                //   eg: xxx(...
                // we assume it's a function
                result += current;
                current = "";
            }

            result += "(";
        } else if(sql[i] === ")") {
            if(current) {
                result += processFragment(current, map);
                current = "";
            }

            result += ")";
        } else if(sql[i] === "`") {
            if(current) {
                result += processFragment(current, map);
                current = "";
            }

            // the inner sql is certainly
            // a key or column name!
            const next = sql.indexOf("`", i + 1);
            if(-1 === next) {
                const rest = sql.substr(i + 1);
                result += "`" + processFragment(rest, map, true);
                break;
            }

            const fragment = sql.substring(i + 1, next);
            result += "`" + processFragment(fragment, map, true) + "`";
            i = next;
        } else {
            current += sql[i];
        }
    }

    if(current) {
        result += processFragment(current, map);
    }

    return result;
};
