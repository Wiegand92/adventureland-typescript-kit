import '@begland/types-adventureland';
import { Entity } from '@begland/types-adventureland';

// Write in your own types here //
// Otherwise uses types from begland's type package //
interface NearestMonsterArgs {
  max_att?: number;
  min_xp?: number;
  target?: string;
  no_target?: boolean;
  path_check?: boolean;
  type?: string;
}
declare global {
  // Modified change_target to only require one parameter //
  function change_target(target: Entity): void;
  // Undefined functions //
  function get_nearest_monster(args: NearestMonsterArgs): Entity;
  function is_moving(target: Entity): boolean;
  function load_code(name_or_slot: string | number, onerror?: Function): void;
}
