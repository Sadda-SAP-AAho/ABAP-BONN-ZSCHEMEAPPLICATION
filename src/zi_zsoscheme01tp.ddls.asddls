@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Projection View forzsoscheme'
define root view entity ZI_zsoscheme01TP
  provider contract transactional_interface
  as projection on ZR_zsoscheme01TP as zsoscheme
{
  key Bukrs,
  key Salesorder,
  key Schemecode,
  key Schemegroupcode,
  Schemecheckcode,
  Orderqty,
  Freeqty,
  AppliedQty,
  CreatedBy,
  CreatedAt,
  LastChangedBy,
  LastChangedAt,
  LocalLastChangedAt,
  _zsoschemelines : redirected to composition child ZI_zsoschemelinesTP
  
}
